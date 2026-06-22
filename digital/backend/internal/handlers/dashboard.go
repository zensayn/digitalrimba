package handlers

import (
	"context"
	"errors"
	"math"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
)

var ErrDashboardWeddingNotFound = errors.New("dashboard wedding not found")

type DashboardDB interface {
	QueryRow(context.Context, string, ...any) pgx.Row
	Query(context.Context, string, ...any) (pgx.Rows, error)
}

type DashboardStore interface {
	GetDashboardOverview(context.Context, string) (DashboardOverview, error)
}

type PostgresDashboardStore struct {
	db DashboardDB
}

func NewPostgresDashboardStore(db DashboardDB) *PostgresDashboardStore {
	return &PostgresDashboardStore{db: db}
}

type DashboardHandler struct {
	store DashboardStore
}

func NewDashboardHandler(store DashboardStore) *DashboardHandler {
	return &DashboardHandler{store: store}
}

func (h *DashboardHandler) RegisterRoutes(r chi.Router) {
	r.Get("/api/dashboard", h.Overview)
}

type DashboardOverview struct {
	Wedding       *DashboardWedding         `json:"wedding"`
	Guests        DashboardGuestSummary     `json:"guests"`
	Budget        DashboardBudgetSummary    `json:"budget"`
	Checklist     DashboardChecklistSummary `json:"checklist"`
	Alerts        DashboardAlerts           `json:"alerts"`
	NextMilestone *DashboardMilestone       `json:"next_milestone"`
}

type DashboardWedding struct {
	ID         string `json:"id"`
	CoupleName string `json:"couple_name"`
	EventDate  string `json:"event_date"`
	Status     string `json:"status"`
}

type DashboardGuestSummary struct {
	Invited   int                          `json:"invited"`
	Confirmed int                          `json:"confirmed"`
	Declined  int                          `json:"declined"`
	Pending   int                          `json:"pending"`
	History   []DashboardGuestHistoryPoint `json:"history"`
}

type DashboardGuestHistoryPoint struct {
	Date      string `json:"date"`
	Confirmed int    `json:"confirmed"`
	Declined  int    `json:"declined"`
	Pending   int    `json:"pending"`
}

type DashboardBudgetSummary struct {
	Total       float64               `json:"total"`
	Spent       float64               `json:"spent"`
	Paid        float64               `json:"paid"`
	Remaining   float64               `json:"remaining"`
	Utilization int                   `json:"utilization"`
	Overspend   bool                  `json:"overspend"`
	NextPayment *DashboardNextPayment `json:"next_payment"`

	alertOverdueBudgetItems int
}

type DashboardNextPayment struct {
	Label   string  `json:"label"`
	Amount  float64 `json:"amount"`
	DueDate string  `json:"due_date"`
	DueIn   int     `json:"due_in"`
}

type DashboardChecklistSummary struct {
	Total     int             `json:"total"`
	Completed int             `json:"completed"`
	Progress  int             `json:"progress"`
	Tasks     []DashboardTask `json:"tasks"`

	alertUrgentTasks  int
	alertOverdueTasks int
}

type DashboardTask struct {
	ID         string `json:"id"`
	Label      string `json:"label"`
	Category   string `json:"category"`
	AssignedTo string `json:"assigned_to"`
	Urgent     bool   `json:"urgent"`
	DueDate    string `json:"due_date"`
}

type DashboardAlerts struct {
	UrgentTasks        int `json:"urgent_tasks"`
	OverdueTasks       int `json:"overdue_tasks"`
	OverdueBudgetItems int `json:"overdue_budget_items"`
	PendingRSVPs       int `json:"pending_rsvps"`
}

type DashboardMilestone struct {
	Label   string `json:"label"`
	DueDate string `json:"due_date"`
	Kind    string `json:"kind"`
}

func (h *DashboardHandler) Overview(w http.ResponseWriter, r *http.Request) {
	userID, ok := UserIDFromContext(r.Context())
	if !ok {
		writeDashboardError(w, ErrForbidden)
		return
	}

	overview, err := h.store.GetDashboardOverview(r.Context(), userID)
	if err != nil {
		writeDashboardError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, normalizeDashboardOverview(overview))
}

func (s *PostgresDashboardStore) GetDashboardOverview(ctx context.Context, userID string) (DashboardOverview, error) {
	wedding, err := s.dashboardWeddingForUser(ctx, userID)
	if errors.Is(err, ErrDashboardWeddingNotFound) {
		return normalizeDashboardOverview(DashboardOverview{}), nil
	}
	if err != nil {
		return DashboardOverview{}, err
	}

	guests, err := s.dashboardGuestSummary(ctx, wedding.ID)
	if err != nil {
		return DashboardOverview{}, err
	}

	budget, err := s.dashboardBudgetSummary(ctx, wedding.ID)
	if err != nil {
		return DashboardOverview{}, err
	}

	checklist, err := s.dashboardChecklistSummary(ctx, wedding.ID)
	if err != nil {
		return DashboardOverview{}, err
	}

	overview := DashboardOverview{
		Wedding:   &wedding,
		Guests:    guests,
		Budget:    budget,
		Checklist: checklist,
		Alerts: DashboardAlerts{
			UrgentTasks:        checklist.alertUrgentTasks,
			OverdueTasks:       checklist.alertOverdueTasks,
			OverdueBudgetItems: budget.alertOverdueBudgetItems,
			PendingRSVPs:       guests.Pending,
		},
	}
	overview.NextMilestone = nextDashboardMilestone(wedding, checklist.Tasks)

	return normalizeDashboardOverview(overview), nil
}

func (s *PostgresDashboardStore) dashboardWeddingForUser(ctx context.Context, userID string) (DashboardWedding, error) {
	wedding, err := scanDashboardWedding(s.db.QueryRow(ctx, dashboardWeddingForMemberSQL, userID))
	if err == nil {
		return wedding, nil
	}
	if !errors.Is(err, pgx.ErrNoRows) && !isUndefinedColumnOrTable(err) {
		return DashboardWedding{}, err
	}

	wedding, err = scanDashboardWedding(s.db.QueryRow(ctx, dashboardWeddingForOwnerSQL, userID))
	if errors.Is(err, pgx.ErrNoRows) {
		return DashboardWedding{}, ErrDashboardWeddingNotFound
	}
	return wedding, err
}

func (s *PostgresDashboardStore) dashboardGuestSummary(ctx context.Context, weddingID string) (DashboardGuestSummary, error) {
	var guests DashboardGuestSummary
	err := s.db.QueryRow(ctx, dashboardGuestSummarySQL, weddingID).Scan(
		&guests.Invited,
		&guests.Confirmed,
		&guests.Declined,
		&guests.Pending,
	)
	if err != nil {
		return DashboardGuestSummary{}, err
	}

	history, err := s.dashboardGuestHistory(ctx, weddingID, guests.Invited)
	if err != nil {
		return DashboardGuestSummary{}, err
	}
	guests.History = history
	return guests, nil
}

func (s *PostgresDashboardStore) dashboardGuestHistory(ctx context.Context, weddingID string, invited int) ([]DashboardGuestHistoryPoint, error) {
	rows, err := s.db.Query(ctx, dashboardGuestHistorySQL, weddingID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	history := []DashboardGuestHistoryPoint{}
	confirmed := 0
	declined := 0
	for rows.Next() {
		var date string
		var confirmedDelta int
		var declinedDelta int
		if err := rows.Scan(&date, &confirmedDelta, &declinedDelta); err != nil {
			return nil, err
		}
		confirmed += confirmedDelta
		declined += declinedDelta
		history = append(history, DashboardGuestHistoryPoint{
			Date:      date,
			Confirmed: confirmed,
			Declined:  declined,
			Pending:   maxInt(invited-confirmed-declined, 0),
		})
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	if len(history) > 5 {
		history = history[len(history)-5:]
	}
	return history, nil
}

func (s *PostgresDashboardStore) dashboardBudgetSummary(ctx context.Context, weddingID string) (DashboardBudgetSummary, error) {
	var budget DashboardBudgetSummary
	var overdue int
	err := s.db.QueryRow(ctx, dashboardBudgetSummarySQL, weddingID).Scan(
		&budget.Total,
		&budget.Spent,
		&budget.Paid,
		&budget.Overspend,
		&overdue,
	)
	if err != nil {
		return DashboardBudgetSummary{}, err
	}

	budget.Remaining = math.Max(budget.Total-budget.Spent, 0)
	budget.Utilization = percentInt(budget.Spent, budget.Total)
	budget.alertOverdueBudgetItems = overdue

	nextPayment, err := s.dashboardNextPayment(ctx, weddingID)
	if err != nil {
		return DashboardBudgetSummary{}, err
	}
	budget.NextPayment = nextPayment
	return budget, nil
}

func (s *PostgresDashboardStore) dashboardNextPayment(ctx context.Context, weddingID string) (*DashboardNextPayment, error) {
	var payment DashboardNextPayment
	err := s.db.QueryRow(ctx, dashboardNextPaymentSQL, weddingID).Scan(
		&payment.Label,
		&payment.Amount,
		&payment.DueDate,
		&payment.DueIn,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &payment, nil
}

func (s *PostgresDashboardStore) dashboardChecklistSummary(ctx context.Context, weddingID string) (DashboardChecklistSummary, error) {
	var checklist DashboardChecklistSummary
	var urgent int
	var overdue int
	err := s.db.QueryRow(ctx, dashboardChecklistSummarySQL, weddingID).Scan(
		&checklist.Total,
		&checklist.Completed,
		&urgent,
		&overdue,
	)
	if err != nil {
		return DashboardChecklistSummary{}, err
	}
	checklist.Progress = percentInt(float64(checklist.Completed), float64(checklist.Total))
	checklist.alertUrgentTasks = urgent
	checklist.alertOverdueTasks = overdue

	tasks, err := s.dashboardTasks(ctx, weddingID)
	if err != nil {
		return DashboardChecklistSummary{}, err
	}
	checklist.Tasks = tasks
	return checklist, nil
}

func (s *PostgresDashboardStore) dashboardTasks(ctx context.Context, weddingID string) ([]DashboardTask, error) {
	rows, err := s.db.Query(ctx, dashboardTasksSQL, weddingID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	tasks := []DashboardTask{}
	for rows.Next() {
		var task DashboardTask
		err := rows.Scan(&task.ID, &task.Label, &task.DueDate, &task.Urgent)
		if err != nil {
			return nil, err
		}
		task.Category = "Checklist"
		task.AssignedTo = "You"
		tasks = append(tasks, task)
	}
	return tasks, rows.Err()
}

func scanDashboardWedding(row rowScanner) (DashboardWedding, error) {
	var wedding DashboardWedding
	err := row.Scan(&wedding.ID, &wedding.CoupleName, &wedding.EventDate, &wedding.Status)
	if err != nil {
		return DashboardWedding{}, err
	}
	return wedding, nil
}

func normalizeDashboardOverview(overview DashboardOverview) DashboardOverview {
	if overview.Guests.History == nil {
		overview.Guests.History = []DashboardGuestHistoryPoint{}
	}
	overview.Guests.Invited = maxInt(overview.Guests.Invited, 0)
	overview.Guests.Confirmed = maxInt(overview.Guests.Confirmed, 0)
	overview.Guests.Declined = maxInt(overview.Guests.Declined, 0)
	overview.Guests.Pending = maxInt(overview.Guests.Pending, 0)

	overview.Budget.Total = math.Max(overview.Budget.Total, 0)
	overview.Budget.Spent = math.Max(overview.Budget.Spent, 0)
	overview.Budget.Paid = math.Max(overview.Budget.Paid, 0)
	overview.Budget.Remaining = math.Max(overview.Budget.Remaining, 0)
	overview.Budget.Utilization = clampInt(overview.Budget.Utilization, 0, 100)

	if overview.Checklist.Tasks == nil {
		overview.Checklist.Tasks = []DashboardTask{}
	}
	overview.Checklist.Total = maxInt(overview.Checklist.Total, 0)
	overview.Checklist.Completed = maxInt(overview.Checklist.Completed, 0)
	overview.Checklist.Progress = clampInt(overview.Checklist.Progress, 0, 100)

	overview.Alerts.UrgentTasks = maxInt(overview.Alerts.UrgentTasks, 0)
	overview.Alerts.OverdueTasks = maxInt(overview.Alerts.OverdueTasks, 0)
	overview.Alerts.OverdueBudgetItems = maxInt(overview.Alerts.OverdueBudgetItems, 0)
	overview.Alerts.PendingRSVPs = maxInt(overview.Alerts.PendingRSVPs, 0)
	return overview
}

func nextDashboardMilestone(wedding DashboardWedding, tasks []DashboardTask) *DashboardMilestone {
	for _, task := range tasks {
		if task.DueDate == "" {
			continue
		}
		return &DashboardMilestone{
			Label:   task.Label,
			DueDate: task.DueDate,
			Kind:    "checklist",
		}
	}
	if wedding.EventDate == "" {
		return nil
	}
	return &DashboardMilestone{
		Label:   "Wedding Day",
		DueDate: wedding.EventDate,
		Kind:    "event",
	}
}

func writeDashboardError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, ErrForbidden):
		http.Error(w, "forbidden", http.StatusForbidden)
	default:
		http.Error(w, "internal server error", http.StatusInternalServerError)
	}
}

func percentInt(value float64, total float64) int {
	if total <= 0 {
		return 0
	}
	return clampInt(int(math.Round((value/total)*100)), 0, 100)
}

func maxInt(value int, floor int) int {
	if value < floor {
		return floor
	}
	return value
}

func clampInt(value int, min int, max int) int {
	if value < min {
		return min
	}
	if value > max {
		return max
	}
	return value
}

const dashboardWeddingForMemberSQL = `
SELECT w.id::text, w.couple_name, COALESCE(w.event_date::text, ''), w.status
FROM wedding_members wm
JOIN weddings w ON w.id = wm.wedding_id
WHERE wm.user_id = $1
ORDER BY w.created_at ASC
LIMIT 1
`

const dashboardWeddingForOwnerSQL = `
SELECT id::text, couple_name, COALESCE(event_date::text, ''), status
FROM weddings
WHERE owner_user_id = $1
ORDER BY created_at ASC
LIMIT 1
`

const dashboardGuestSummarySQL = `
SELECT
    COUNT(g.id)::int AS invited,
    COUNT(g.id) FILTER (WHERE r.status = 'confirmed')::int AS confirmed,
    COUNT(g.id) FILTER (WHERE r.status = 'declined')::int AS declined,
    COUNT(g.id) FILTER (
        WHERE r.status IS NULL OR r.status NOT IN ('confirmed', 'declined')
    )::int AS pending
FROM guests g
LEFT JOIN rsvp r ON r.guest_id = g.id
WHERE g.wedding_id = $1::uuid
`

const dashboardGuestHistorySQL = `
SELECT
    TO_CHAR(day, 'Mon DD') AS date_label,
    confirmed_delta,
    declined_delta
FROM (
    SELECT
        responded_at::date AS day,
        COUNT(*) FILTER (WHERE status = 'confirmed')::int AS confirmed_delta,
        COUNT(*) FILTER (WHERE status = 'declined')::int AS declined_delta
    FROM rsvp
    WHERE wedding_id = $1::uuid
      AND responded_at IS NOT NULL
    GROUP BY responded_at::date
) days
ORDER BY day ASC
`

const dashboardBudgetSummarySQL = `
SELECT
    COALESCE(SUM(estimated_amount), 0)::float8 AS total,
    COALESCE(SUM(actual_amount), 0)::float8 AS spent,
    COALESCE(SUM(actual_amount) FILTER (WHERE paid), 0)::float8 AS paid,
    COALESCE(BOOL_OR(actual_amount > estimated_amount), false) AS overspend,
    COUNT(*) FILTER (WHERE due_date < CURRENT_DATE AND NOT paid)::int AS overdue_items
FROM budget_items
WHERE wedding_id = $1::uuid
`

const dashboardNextPaymentSQL = `
SELECT
    item_name,
    CASE WHEN actual_amount > 0 THEN actual_amount ELSE estimated_amount END::float8 AS amount,
    due_date::text,
    (due_date - CURRENT_DATE)::int AS due_in
FROM budget_items
WHERE wedding_id = $1::uuid
  AND NOT paid
  AND due_date IS NOT NULL
ORDER BY due_date ASC, created_at ASC, id ASC
LIMIT 1
`

const dashboardChecklistSummarySQL = `
SELECT
    COUNT(*)::int AS total,
    COUNT(*) FILTER (WHERE completed_at IS NOT NULL)::int AS completed,
    COUNT(*) FILTER (
        WHERE completed_at IS NULL
          AND due_date IS NOT NULL
          AND due_date <= CURRENT_DATE + INTERVAL '7 days'
    )::int AS urgent,
    COUNT(*) FILTER (
        WHERE completed_at IS NULL
          AND due_date IS NOT NULL
          AND due_date < CURRENT_DATE
    )::int AS overdue
FROM checklist_items
WHERE wedding_id = $1::uuid
`

const dashboardTasksSQL = `
SELECT
    id::text,
    title,
    COALESCE(due_date::text, ''),
    (
        due_date IS NOT NULL
        AND due_date <= CURRENT_DATE + INTERVAL '7 days'
    ) AS urgent
FROM checklist_items
WHERE wedding_id = $1::uuid
  AND completed_at IS NULL
ORDER BY due_date ASC NULLS LAST, sort_order ASC, created_at ASC, id ASC
LIMIT 3
`

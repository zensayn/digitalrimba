export default function TeamPage() {
    const team = [
        "Andrie Wijaya",
        "Dean Dota Pettara",
        "Pangkywara Segoro",
        "Raditya Indra",
        "Rayhan Dwi"
    ];

    return (
        <div className="relative min-h-screen bg-white text-[#101828] overflow-x-hidden selection:bg-blue-50 flex flex-col font-sans">
            <div className="fixed inset-0 pointer-events-none z-0 opacity-40">
            </div>

            <main className="flex-grow flex flex-col justify-center items-center pt-32 pb-24 z-10 px-6 mt-16">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-16 fade-up">Our Team</h1>

                <div className="flex flex-col gap-4 w-full max-w-2xl">
                    {team.map((name, i) => (
                        <div
                            key={name}
                            className={`fade-up delay-1 p-6 border border-gray-100 rounded-3xl bg-white/50 backdrop-blur-sm flex justify-between items-center hover:bg-gray-50 hover:scale-[1.02] transition-all cursor-default shadow-sm`}
                            style={{ animationDelay: `${(i + 1) * 100}ms` }}
                        >
                            <span className="text-xl md:text-2xl font-medium tracking-tight text-gray-900">{name}</span>
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">
                                {name.charAt(0)}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}

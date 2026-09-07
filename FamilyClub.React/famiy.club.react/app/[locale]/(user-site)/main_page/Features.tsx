export default function Features() {
    const items = [
        "Велика бібліотека",
        "Швидка доставка",
        "Знижки",
        "Подарунки",
    ];

    return (
        <section className="bg-green-700 text-white py-10 px-8">
            <div className="grid grid-cols-4 gap-6 text-center">
                {items.map((item, i) => (
                    <div key={i} className="p-4">
                        <div className="h-12 mb-2 bg-white/30 rounded" />
                        <p>{item}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
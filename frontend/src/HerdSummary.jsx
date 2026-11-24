import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Cell,
    ResponsiveContainer,
} from "recharts";

export default function HerdSummary({ results }) {
    const count = (level) => results.filter((r) => r.risk_level === level).length;

    const data = [
        { name: "Высокий", value: count("high"), color: "#dc2626" },
        { name: "Средний", value: count("medium"), color: "#f59e0b" },
        { name: "Низкий", value: count("low"), color: "#16a34a" },
    ];

    const avg =
        results.reduce((sum, r) => sum + r.probability, 0) / results.length;

    return (
        <div className="analytics">
            <h2>Сводка по стаду</h2>
            <p>
                Коров в анализе: <b>{results.length}</b>. Средняя вероятность:{" "}
                <b>{Math.round(avg * 100)}%</b>.
            </p>
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data}>
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" name="Коров">
                        {data.map((d) => (
                            <Cell key={d.name} fill={d.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
import { useEffect, useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ReferenceLine,
    ResponsiveContainer,
} from "recharts";
import { getCowHistory } from "./api";

const METRICS = [
    { key: "temperature", title: "Температура, °C", color: "#dc2626" },
    { key: "rumination", title: "Жвачка, мин/сутки", color: "#2563eb" },
    { key: "activity", title: "Активность, шагов/час", color: "#16a34a" },
];

const average = (values) => values.reduce((a, b) => a + b, 0) / values.length;

export default function CowDetails({ cow, onClose }) {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        let cancelled = false;
        getCowHistory(cow.cow_id, cow.probability).then((h) => {
            if (!cancelled) setHistory(h);
        });
        return () => {
            cancelled = true;
        };
    }, [cow]);

    // Индивидуальная норма: среднее за первые 3 дня недели
    const norm = (key) =>
        history.length ? average(history.slice(0, 3).map((d) => d[key])) : 0;

    const deviation = (key) => {
        if (!history.length) return 0;
        const last = history[history.length - 1][key];
        return ((last - norm(key)) / norm(key)) * 100;
    };

    return (
        <div className="overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Корова {cow.cow_id}</h2>
                    <button className="secondary" onClick={onClose}>
                        Закрыть
                    </button>
                </div>

                <p className="note">
                    Тестовые данные: настоящая история появится после подключения базы.
                </p>

                <p>
                    Вероятность мастита: <b>{Math.round(cow.probability * 100)}%</b>
                </p>

                {history.length > 0 && (
                    <>
                        <h3>Отклонение от индивидуальной нормы</h3>
                        <ul className="deviations">
                            {METRICS.map((m) => {
                                const dev = deviation(m.key);
                                return (
                                    <li key={m.key}>
                                        {m.title}:{" "}
                                        <b>
                                            {dev > 0 ? "+" : ""}
                                            {dev.toFixed(1)}%
                                        </b>
                                    </li>
                                );
                            })}
                        </ul>

                        {METRICS.map((m) => (
                            <div key={m.key} className="chart-block">
                                <h3>{m.title}</h3>
                                <ResponsiveContainer width="100%" height={180}>
                                    <LineChart data={history}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis domain={["auto", "auto"]} />
                                        <Tooltip />
                                        <ReferenceLine
                                            y={norm(m.key)}
                                            stroke="#9ca3af"
                                            strokeDasharray="5 5"
                                            label="норма"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey={m.key}
                                            stroke={m.color}
                                            strokeWidth={2}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}

const [error, setError] = useState("");

useEffect(() => {
    let cancelled = false;
    getCowHistory(cow.cow_id)
        .then((h) => {
            if (!cancelled) setHistory(h);
        })
        .catch((e) => {
            if (!cancelled) setError(e.message);
        });
    return () => {
        cancelled = true;
    };
}, [cow]);
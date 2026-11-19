import { useState } from "react";
import "./App.css";

const API_URL = "http://localhost:8000";

const RISK_LABELS = { high: "Высокий", medium: "Средний", low: "Низкий" };

export default function App() {
    const [file, setFile] = useState(null);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit() {
        if (!file) return;
        setLoading(true);
        setError("");

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(`${API_URL}/predict/csv`, {
                method: "POST",
                body: formData,
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(
                    typeof err.detail === "string"
                        ? err.detail
                        : `Ошибка сервера (${res.status})`
                );
            }
            setResults(await res.json());
        } catch (e) {
            setResults([]);
            setError(
                e instanceof TypeError
                    ? "Не удалось связаться с сервером. Запущен ли бэкенд на " + API_URL + "?"
                    : e.message
            );
        } finally {
            setLoading(false);
        }
    }

    const count = (level) => results.filter((r) => r.risk_level === level).length;

    return (
        <div className="page">
            <h1>Раннее выявление мастита</h1>
            <p className="subtitle">
                Загрузите CSV с данными датчиков по стаду (колонки: cow_id, activity,
                rumination, temperature).
            </p>

            <div className="upload">
                <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setFile(e.target.files[0] ?? null)}
                />
                <button onClick={handleSubmit} disabled={!file || loading}>
                    {loading ? "Анализ..." : "Проанализировать"}
                </button>
            </div>

            {error && <div className="error">{error}</div>}

            {results.length > 0 && (
                <>
                    <div className="summary">
                        <div className="card high">Высокий риск: {count("high")}</div>
                        <div className="card medium">Средний риск: {count("medium")}</div>
                        <div className="card low">Низкий риск: {count("low")}</div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Корова</th>
                                <th>Вероятность мастита</th>
                                <th>Уровень риска</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((r) => (
                                <tr key={r.cow_id}>
                                    <td>{r.cow_id}</td>
                                    <td>{Math.round(r.probability * 100)}%</td>
                                    <td>
                                        <span className={`badge ${r.risk_level}`}>
                                            {RISK_LABELS[r.risk_level] ?? r.risk_level}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}
        </div>
    );
}
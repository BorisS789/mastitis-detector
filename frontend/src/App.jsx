import { useState } from "react";
import "./App.css";
import { predictCsv, API_URL } from "./api";
import CowDetails from "./CowDetails";
import HerdSummary from "./HerdSummary";

const RISK_LABELS = { high: "Высокий", medium: "Средний", low: "Низкий" };

export default function App() {
    const [file, setFile] = useState(null);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedCow, setSelectedCow] = useState(null);
    const [showSummary, setShowSummary] = useState(false);

    async function handleSubmit() {
        if (!file) return;
        setLoading(true);
        setError("");
        try {
            setResults(await predictCsv(file));
            setShowSummary(false);
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
                rumination, temperature). Система подсказывает, каких коров осмотреть
                в первую очередь, диагноз ставит ветеринар.
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

                    <button
                        className="secondary"
                        onClick={() => setShowSummary((v) => !v)}
                    >
                        {showSummary ? "Скрыть сводку" : "Сводка по стаду"}
                    </button>

                    {showSummary && <HerdSummary results={results} />}

                    <table>
                        <thead>
                            <tr>
                                <th>Корова</th>
                                <th>Вероятность</th>
                                <th>Уровень риска</th>
                                <th></th>
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
                                    <td>
                                        <button
                                            className="secondary"
                                            onClick={() => setSelectedCow(r)}
                                        >
                                            Динамика
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}

            {selectedCow && (
                <CowDetails cow={selectedCow} onClose={() => setSelectedCow(null)} />
            )}
        </div>
    );
}
"use client";

import { useState, useEffect } from "react";

export default function Home() {
    const [logs, setLogs] = useState([]);
    const [status, setStatus] = useState("Stopped");

    const start = async () => {
        await fetch("http://localhost:8000/start", { method: "POST" });
        setStatus("Running");
    };

    const stop = async () => {
        await fetch("http://localhost:8000/stop", { method: "POST" });
        setStatus("Stopped");
    };

    useEffect(() => {
        const interval = setInterval(async () => {
            const res = await fetch("http://localhost:8000/logs");
            const data = await res.json();
            setLogs(data.logs);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <main className="p-6 bg-black text-white min-h-screen font-mono">
            <h1 className="text-2xl font-bold mb-4">🛡️ NetSleuth Dashboard</h1>
            <p>Status: <span className="text-green-400">{status}</span></p>
            <div className="my-4 space-x-4">
                <button onClick={start} className="bg-green-600 px-4 py-2 rounded">Start</button>
                <button onClick={stop} className="bg-red-600 px-4 py-2 rounded">Stop</button>
            </div>
            <h2 className="text-xl mb-2 mt-6">📋 Attack Logs</h2>
            <table className="table-auto w-full text-sm border border-white border-collapse">
                <thead>
                    <tr className="bg-gray-800">
                        <th className="border px-2 py-1">Time</th>
                        <th className="border px-2 py-1">Source IP</th>
                        <th className="border px-2 py-1">Attack Type</th>
                        <th className="border px-2 py-1">Details</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map((log, i) => (
                        <tr key={i} className="bg-gray-900">
                            <td className="border px-2 py-1">{log.time}</td>
                            <td className="border px-2 py-1">{log.source_ip}</td>
                            <td className="border px-2 py-1">{log.attack_type}</td>
                            <td className="border px-2 py-1">{log.details}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </main>
    );
}
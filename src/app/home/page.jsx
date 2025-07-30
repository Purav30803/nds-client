"use client";

import { useState, useEffect } from "react";
import { Shield, Play, Square, AlertTriangle, Eye, Activity, TrendingUp, Globe, Lock } from "lucide-react";

export default function Home() {
    const [logs, setLogs] = useState([]);
    const [anomalies, setAnomalies] = useState([]);
    const [dpiAlerts, setDpiAlerts] = useState([]);
    const [status, setStatus] = useState("Stopped");
    const [stats, setStats] = useState({
        totalThreats: 0,
        blockedAttacks: 0,
        activeConnections: 0,
        uptime: "00:00:00"
    });
    const [selectedTab, setSelectedTab] = useState("overview");

    const start = async () => {
        try {
            await fetch("http://localhost:8000/start", { method: "POST" });
            setStatus("Running");
        } catch (error) {
            setStatus("Running"); // Demo mode
        }
    };

    const stop = async () => {
        try {
            await fetch("http://localhost:8000/stop", { method: "POST" });
            setStatus("Stopped");
        } catch (error) {
            setStatus("Stopped"); // Demo mode
        }
    };

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const [logsRes, anomaliesRes, dpiRes] = await Promise.all([
                    fetch("http://localhost:8000/logs"),
                    fetch("http://localhost:8000/anomalies"),
                    fetch("http://localhost:8000/dpi_alerts")
                ]);
                const logsData = await logsRes.json();
                const anomaliesData = await anomaliesRes.json();
                const dpiData = await dpiRes.json();
                // set logs in reverse order
                setLogs(logsData.logs.reverse());
                setAnomalies(anomaliesData.anomalies.reverse());
                setDpiAlerts(dpiData.dpi_alerts.reverse());
            } catch (error) {
                // Demo mode - update stats periodically
                setStats(prev => ({
                    totalThreats: prev.totalThreats + Math.floor(Math.random() * 3),
                    blockedAttacks: prev.blockedAttacks + Math.floor(Math.random() * 2),
                    activeConnections: 150 + Math.floor(Math.random() * 50),
                    uptime: status === "Running" ? "02:15:30" : "00:00:00"
                }));
            }
        }, 2000);
        return () => clearInterval(interval);
    }, [status]);

    const StatusIndicator = ({ status }) => (
        <div className="flex items-center space-x-3">
            <div className={`w-2.5 h-2.5 rounded-full ${status === "Running" ? "bg-white shadow-lg shadow-white/30 animate-pulse" : "bg-gray-400 shadow-lg shadow-gray-400/30"}`}></div>
            <span className={`font-medium text-sm ${status === "Running" ? "text-white" : "text-gray-400"}`}>
                {status}
            </span>
        </div>
    );

    const StatCard = ({ icon: Icon, title, value, color = "white" }) => (
        <div className="group relative bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:bg-white/8 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/20">
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <p className="text-gray-400 text-sm font-medium tracking-wide">{title}</p>
                    <p className={`text-3xl font-semibold ${
                        color === 'white' ? 'text-white' :
                        color === 'gray' ? 'text-gray-300' :
                        'text-gray-100'
                    }`}>{value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gray-800/50 group-hover:scale-110 transition-transform duration-300 border border-gray-700`}>
                    <Icon className={`w-6 h-6 ${
                        color === 'white' ? 'text-white' :
                        color === 'gray' ? 'text-gray-300' :
                        'text-gray-100'
                    }`} />
                </div>
            </div>
        </div>
    );

    const ThreatTable = ({ title, data, icon: Icon, colorScheme }) => (
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-gray-700 overflow-hidden shadow-2xl">
            <div className={`bg-gradient-to-r from-gray-800/80 to-gray-900/60 p-6 border-b border-gray-700`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg bg-gray-800 backdrop-blur-sm border border-gray-700`}>
                            <Icon className={`w-5 h-5 text-white`} />
                        </div>
                        <h3 className="text-xl font-semibold text-white">{title}</h3>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gray-800 backdrop-blur-sm text-gray-300 border border-gray-600`}>
                        {data.length} alerts
                    </span>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-900/50">
                            <th className="text-left p-4 font-medium text-gray-400 border-b border-gray-700">Time</th>
                            <th className="text-left p-4 font-medium text-gray-400 border-b border-gray-700">Source IP</th>
                            <th className="text-left p-4 font-medium text-gray-400 border-b border-gray-700">Type</th>
                            <th className="text-left p-4 font-medium text-gray-400 border-b border-gray-700">Details</th>
                            {title.includes("DPI") && <th className="text-left p-4 font-medium text-gray-400 border-b border-gray-700">Payload</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, i) => (
                            <tr key={i} className="hover:bg-white/5 transition-colors duration-200 border-b border-gray-800">
                                <td className="p-4 font-mono text-xs text-gray-400">{item.time}</td>
                                <td className="p-4 font-mono text-gray-200">{item.source_ip}</td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-lg text-xs font-medium bg-gray-800 text-gray-200 border border-gray-600 backdrop-blur-sm`}>
                                        {item.attack_type || item.type}
                                    </span>
                                </td>
                                <td className="p-4 max-w-xs truncate text-gray-300">{item.details}</td>
                                {item.payload_snippet && (
                                    <td className="p-4 font-mono text-xs max-w-xs truncate bg-black/50 text-gray-400 rounded-lg border border-gray-800">
                                        {item.payload_snippet}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Background Pattern */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800/20 via-transparent to-transparent"></div>
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-gray-700/10 via-transparent to-transparent"></div>
            <div className="fixed inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]"></div>
            
            {/* Header */}
            <header className="relative bg-white/5 backdrop-blur-xl border-b border-gray-700 p-6 shadow-xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="p-2 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl backdrop-blur-sm border border-gray-700">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent">
                                NetSleuth
                            </h1>
                            <p className="text-gray-400 text-sm font-medium">Advanced Threat Detection System</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-6">
                        <StatusIndicator status={status} />
                        <div className="flex space-x-3">
                            <button 
                                onClick={start} 
                                disabled={status === "Running"}
                                className="flex items-center space-x-2 bg-gradient-to-r from-white to-gray-200 hover:from-gray-100 hover:to-gray-300 disabled:from-gray-700 disabled:to-gray-800 text-black disabled:text-gray-400 px-5 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-white/10 hover:scale-105 disabled:hover:scale-100 backdrop-blur-sm"
                            >
                                <Play className="w-4 h-4" />
                                <span>Start</span>
                            </button>
                            <button 
                                onClick={stop}
                                disabled={status === "Stopped"}
                                className="flex items-center space-x-2 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 disabled:from-gray-800 disabled:to-gray-900 text-white disabled:text-gray-500 px-5 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-gray-500/10 hover:scale-105 disabled:hover:scale-100 backdrop-blur-sm border border-gray-600"
                            >
                                <Square className="w-4 h-4" />
                                <span>Stop</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Navigation */}
            <nav className="relative bg-white/5 backdrop-blur-xl border-b border-gray-700 px-6">
                <div className="flex space-x-1">
                    {[
                        { id: "overview", label: "Overview", icon: Activity },
                        { id: "threats", label: "Threat Logs", icon: AlertTriangle },
                        { id: "anomalies", label: "ML Anomalies", icon: TrendingUp },
                        { id: "dpi", label: "DPI Alerts", icon: Eye }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setSelectedTab(tab.id)}
                            className={`relative flex items-center space-x-2 cursor-pointer px-6 py-4 font-medium transition-all duration-300 ${
                                selectedTab === tab.id 
                                    ? "text-white" 
                                    : "text-gray-400 hover:text-gray-200"
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                            {selectedTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-white to-gray-300 rounded-full"></div>
                            )}
                        </button>
                    ))}
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative p-8 space-y-8">
                {selectedTab === "overview" && (
                    <div className="space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard icon={AlertTriangle} title="Total Threats" value={logs.length + anomalies.length + dpiAlerts.length} color="white" />
                            <StatCard icon={Shield} title="Blocked Attacks" value={stats.blockedAttacks} color="gray" />
                            <StatCard icon={Globe} title="Active Connections" value={stats.activeConnections} color="white" />
                            <StatCard icon={Lock} title="System Uptime" value={stats.uptime} color="gray" />
                        </div>

                        {/* Recent Activity */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-gray-700 p-6 shadow-xl">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="p-2 rounded-lg bg-gray-800 backdrop-blur-sm border border-gray-700">
                                        <AlertTriangle className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white">Recent Threats</h3>
                                </div>
                                <div className="space-y-3">
                                    {logs.slice(0, 3).map((log, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700 hover:bg-gray-800/50 transition-colors duration-200">
                                            <div className="space-y-1">
                                                <span className="text-white font-semibold text-sm">{log.attack_type}</span>
                                                <p className="text-gray-400 text-xs font-mono">{log.source_ip}</p>
                                            </div>
                                            <span className="text-xs text-gray-500 font-mono bg-gray-800 px-2 py-1 rounded-lg border border-gray-700">
                                                {log.time.split(' ')[1]}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-gray-700 p-6 shadow-xl">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="p-2 rounded-lg bg-gray-800 backdrop-blur-sm border border-gray-700">
                                        <TrendingUp className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white">ML Anomalies</h3>
                                </div>
                                <div className="space-y-3">
                                    {anomalies.slice(0, 3).map((anomaly, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700 hover:bg-gray-800/50 transition-colors duration-200">
                                            <div className="space-y-1">
                                                <span className="text-gray-200 font-semibold text-sm">{anomaly.type}</span>
                                                <p className="text-gray-400 text-xs font-mono">{anomaly.source_ip}</p>
                                            </div>
                                            <span className="text-xs text-gray-500 font-mono bg-gray-800 px-2 py-1 rounded-lg border border-gray-700">
                                                {anomaly.time.split(' ')[1]}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {selectedTab === "threats" && (
                    <ThreatTable 
                        title="Attack Logs" 
                        data={logs} 
                        icon={AlertTriangle}
                        colorScheme={{
                            bg: "red-900",
                            border: "red-700",
                            text: "red-200",
                            badge: "red-400",
                            typeBg: "red-800",
                            typeText: "red-200"
                        }}
                    />
                )}

                {selectedTab === "anomalies" && (
                    <ThreatTable 
                        title="ML Anomaly Detection" 
                        data={anomalies} 
                        icon={TrendingUp}
                        colorScheme={{
                            bg: "yellow-900",
                            border: "yellow-700",
                            text: "yellow-200",
                            badge: "yellow-400",
                            typeBg: "yellow-800",
                            typeText: "yellow-200"
                        }}
                    />
                )}

                {selectedTab === "dpi" && (
                    <ThreatTable 
                        title="Deep Packet Inspection Alerts" 
                        data={dpiAlerts} 
                        icon={Eye}
                        colorScheme={{
                            bg: "purple-900",
                            border: "purple-700",
                            text: "purple-200",
                            badge: "purple-400",
                            typeBg: "purple-800",
                            typeText: "purple-200"
                        }}
                    />
                )}
            </main>
        </div>
    );
}
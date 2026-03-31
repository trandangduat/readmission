'use client';

import { useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  Brain,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  CircleDot,
  Layers3,
  LineChart,
  Search,
  Stethoscope,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  ReferenceLine,
} from 'recharts';

type TabKey = 'overview' | 'new-patients' | 'lookup' | 'performance';

const sidebarItems = [
  { key: 'overview' as const, label: 'Overview', icon: Layers3 },
  { key: 'new-patients' as const, label: 'New Patients', icon: ClipboardList },
  { key: 'lookup' as const, label: 'Patient Lookup', icon: Search },
  { key: 'performance' as const, label: 'Model Performance', icon: BarChart3 },
];

const overviewKpis = [
  { label: 'Total Readmissions', value: '1,284', note: '+8.4% vs last month' },
  { label: '30-Day Readmission Rate', value: '14.8%', note: '-1.3% from baseline' },
  { label: 'Average Risk Score', value: '62%', note: 'Trending stable' },
];

const serviceData = [
  { department: 'Cardiology', readmissions: 214 },
  { department: 'Surgery', readmissions: 176 },
  { department: 'Neurology', readmissions: 132 },
  { department: 'Oncology', readmissions: 108 },
  { department: 'Pulmonology', readmissions: 97 },
  { department: 'Geriatrics', readmissions: 88 },
];

const diagnosisData = [
  { name: 'Heart Failure', value: 34 },
  { name: 'Diabetes', value: 24 },
  { name: 'COPD', value: 18 },
  { name: 'Sepsis', value: 14 },
  { name: 'Pneumonia', value: 10 },
];

const diagnosisColors = ['#2563eb', '#60a5fa', '#f59e0b', '#ef4444', '#14b8a6'];

const newPatients = [
  { name: 'Maria Lopez', age: 74, admissionDate: '2026-03-29', department: 'Cardiology', risk: 87 },
  { name: 'James Carter', age: 58, admissionDate: '2026-03-28', department: 'Surgery', risk: 64 },
  { name: 'Amina Hassan', age: 69, admissionDate: '2026-03-27', department: 'Pulmonology', risk: 42 },
  { name: 'Robert King', age: 81, admissionDate: '2026-03-27', department: 'Geriatrics', risk: 91 },
  { name: 'Priya Nair', age: 46, admissionDate: '2026-03-26', department: 'Neurology', risk: 56 },
];

const patients = [
  {
    id: 'PT-88421',
    name: 'Maria Lopez',
    age: 74,
    gender: 'Female',
    primaryDx: 'Heart Failure',
    risk: 87,
    timeline: ['Jan 12: ED admission', 'Jan 16: ICU transfer', 'Feb 04: Readmitted', 'Mar 20: Current stay'],
    factors: [
      { label: 'Prior Admissions', detail: '3 (+15% risk)', direction: 'up' },
      { label: 'Comorbidity', detail: 'Diabetes (+12% risk)', direction: 'up' },
      { label: 'Medication Adherence', detail: 'Low (-7% risk)', direction: 'down' },
      { label: 'Length of Stay', detail: '8 days (+9% risk)', direction: 'up' },
    ],
  },
  {
    id: 'PT-44109',
    name: 'James Carter',
    age: 58,
    gender: 'Male',
    primaryDx: 'COPD',
    risk: 61,
    timeline: ['Jan 08: Routine admission', 'Feb 19: Observation', 'Mar 10: Current stay'],
    factors: [
      { label: 'Smoking History', detail: 'Former smoker (+8% risk)', direction: 'up' },
      { label: 'Oxygen Support', detail: 'Required (+10% risk)', direction: 'up' },
      { label: 'Follow-up Plan', detail: 'Scheduled (-6% risk)', direction: 'down' },
    ],
  },
];

const performanceStats = [
  { label: 'True Positive', value: '182' },
  { label: 'False Negative', value: '24' },
  { label: 'False Positive', value: '31' },
  { label: 'True Negative', value: '611' },
];

const rocData = [
  { fpr: 0, tpr: 0 },
  { fpr: 0.03, tpr: 0.27 },
  { fpr: 0.08, tpr: 0.49 },
  { fpr: 0.13, tpr: 0.61 },
  { fpr: 0.2, tpr: 0.75 },
  { fpr: 0.28, tpr: 0.84 },
  { fpr: 0.38, tpr: 0.9 },
  { fpr: 0.54, tpr: 0.95 },
  { fpr: 1, tpr: 1 },
];

const metrics = [
  ['Accuracy', '91.2%'],
  ['Precision', '85.7%'],
  ['Recall', '88.1%'],
  ['F1-Score', '86.9%'],
];

function riskTone(score: number) {
  if (score > 80) return 'bg-red-50 text-red-700 ring-red-200';
  if (score >= 50) return 'bg-amber-50 text-amber-700 ring-amber-200';
  return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
}

function riskLabel(score: number) {
  if (score > 80) return 'High Risk';
  if (score >= 50) return 'Moderate Risk';
  return 'Low Risk';
}

export default function Page() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [query, setQuery] = useState('Maria Lopez');
  const [selectedPatient, setSelectedPatient] = useState(patients[0]);
  const [predictionOpen, setPredictionOpen] = useState(false);
  const [prediction, setPrediction] = useState({ age: 72, comorbidity: 'Diabetes + CHF', los: 6 });
  const [liveScore, setLiveScore] = useState(78);

  const searchedPatient = useMemo(
    () =>
      patients.find(
        (patient) =>
          patient.id.toLowerCase() === query.trim().toLowerCase() ||
          patient.name.toLowerCase().includes(query.trim().toLowerCase()),
      ) ?? null,
    [query],
  );

  const handleSearch = () => {
    if (searchedPatient) setSelectedPatient(searchedPatient);
  };

  const runLivePrediction = () => {
    const score = Math.min(96, Math.max(18, Math.round(prediction.age * 0.55 + prediction.los * 6 + 18)));
    setLiveScore(score);
    setPredictionOpen(true);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="fixed inset-y-0 left-0 z-20 w-72 border-r border-slate-200 bg-white/90 shadow-soft backdrop-blur-xl">
          <div className="flex h-full flex-col px-5 py-6">
            <div className="mb-8 flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-blue-200">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-semibold tracking-tight text-slate-900">ReadmitAI</p>
                <p className="text-xs text-slate-500">Predictive Readmission Analytics</p>
              </div>
            </div>

            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all duration-300 ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-lg shadow-blue-200'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                    {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                  </button>
                );
              })}
            </nav>

            <div className="mt-auto rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <CircleDot className="h-4 w-4 text-emerald-500" />
                Model Status
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Inference Latency</span>
                  <span className="font-medium text-slate-900">120 ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Data Sync</span>
                  <span className="font-medium text-slate-900">Live</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="ml-72 flex-1 px-6 py-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <header className="glass rounded-3xl border border-white/60 px-6 py-5 shadow-soft">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.24em] text-brand-700">Healthcare Analytics</p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                    30-Day Readmission Prediction Command Center
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm text-slate-600">
                    Big-data clinical intelligence for operational teams, discharge planners, and care coordination.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <MetricPill icon={Users} value="12.4k" label="Patients" />
                  <MetricPill icon={CalendarDays} value="98.1%" label="Data Freshness" />
                  <MetricPill icon={Brain} value="XGBoost" label="Model" />
                  <MetricPill icon={Stethoscope} value="18" label="Units" />
                </div>
              </div>
            </header>

            <section className="transition-all duration-500">
              {activeTab === 'overview' && <OverviewView />}
              {activeTab === 'new-patients' && (
                <NewPatientsView
                  predictionOpen={predictionOpen}
                  setPredictionOpen={setPredictionOpen}
                  prediction={prediction}
                  setPrediction={setPrediction}
                  liveScore={liveScore}
                  runLivePrediction={runLivePrediction}
                />
              )}
              {activeTab === 'lookup' && (
                <LookupView
                  query={query}
                  setQuery={setQuery}
                  onSearch={handleSearch}
                  selectedPatient={selectedPatient}
                />
              )}
              {activeTab === 'performance' && <PerformanceView />}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

function MetricPill({ icon: Icon, value, label }: { icon: React.ComponentType<{ className?: string }>; value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <Icon className="h-4 w-4 text-brand-600" />
      <p className="mt-2 text-lg font-semibold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

function OverviewView() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        {overviewKpis.map((kpi) => (
          <article key={kpi.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
            <div className="mt-3 flex items-end justify-between gap-4">
              <p className="text-3xl font-semibold tracking-tight text-slate-900">{kpi.value}</p>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">{kpi.note}</span>
            </div>
          </article>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Readmissions by Service</h2>
              <p className="text-sm text-slate-500">Department-level volume distribution</p>
            </div>
            <BarChart3 className="h-5 w-5 text-brand-600" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceData} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="department" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip />
                <Bar dataKey="readmissions" radius={[10, 10, 0, 0]} fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Readmission Rate by Diagnosis</h2>
              <p className="text-sm text-slate-500">Primary diagnosis mix among high-risk admissions</p>
            </div>
            <LineChart className="h-5 w-5 text-brand-600" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={diagnosisData} dataKey="value" innerRadius={72} outerRadius={108} paddingAngle={3}>
                  {diagnosisData.map((entry, index) => (
                    <Cell key={entry.name} fill={diagnosisColors[index % diagnosisColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={24} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}

function NewPatientsView({
  predictionOpen,
  setPredictionOpen,
  prediction,
  setPrediction,
  liveScore,
  runLivePrediction,
}: {
  predictionOpen: boolean;
  setPredictionOpen: (value: boolean) => void;
  prediction: { age: number; comorbidity: string; los: number };
  setPrediction: React.Dispatch<React.SetStateAction<{ age: number; comorbidity: string; los: number }>>;
  liveScore: number;
  runLivePrediction: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-soft lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Pending Discharges & Live Predictions</h2>
          <p className="mt-1 text-sm text-slate-500">Review patients ready for discharge and launch a fast risk simulation.</p>
        </div>
        <button
          onClick={runLivePrediction}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-brand-700"
        >
          <Brain className="h-4 w-4" />
          Run Live Prediction
        </button>
      </div>

      {predictionOpen && (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Instant AI Input</h3>
                <p className="text-sm text-slate-500">Adjust clinical inputs to simulate readmission risk.</p>
              </div>
              <button onClick={() => setPredictionOpen(false)} className="text-sm font-medium text-slate-500 hover:text-slate-900">
                Close
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Age" value={prediction.age} onChange={(v) => setPrediction((prev) => ({ ...prev, age: Number(v) }))} />
              <Field
                label="Comorbidity"
                value={prediction.comorbidity}
                text
                onChange={(v) => setPrediction((prev) => ({ ...prev, comorbidity: String(v) }))}
              />
              <Field label="Length of Stay" value={prediction.los} onChange={(v) => setPrediction((prev) => ({ ...prev, los: Number(v) }))} />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-brand-50 to-white p-5 shadow-soft">
            <p className="text-sm font-medium text-slate-500">Live Prediction Result</p>
            <div className="mt-3 flex items-end gap-3">
              <span className="text-5xl font-semibold tracking-tight text-slate-900">{liveScore}%</span>
              <span className={`mb-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${riskTone(liveScore)}`}>
                {riskLabel(liveScore)}
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              Estimated risk based on age, comorbidity burden, and expected stay pattern.
            </p>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-lg font-semibold text-slate-900">Newly Admitted / Ready-to-Discharge Patients</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {['Patient Name', 'Age', 'Admission Date', 'Department', 'Predicted Risk Score'].map((head) => (
                  <th key={head} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {newPatients.map((patient) => (
                <tr key={patient.name} className="hover:bg-slate-50/80">
                  <td className="px-5 py-4 text-sm font-medium text-slate-900">{patient.name}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{patient.age}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{patient.admissionDate}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{patient.department}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${riskTone(patient.risk)}`}>
                      {patient.risk}% {riskLabel(patient.risk)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  text,
}: {
  label: string;
  value: number | string;
  onChange: (value: number | string) => void;
  text?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <input
        type={text ? 'text' : 'number'}
        value={value}
        onChange={(e) => onChange(text ? e.target.value : Number(e.target.value))}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:bg-white"
      />
    </label>
  );
}

function LookupView({
  query,
  setQuery,
  onSearch,
  selectedPatient,
}: {
  query: string;
  setQuery: (value: string) => void;
  onSearch: () => void;
  selectedPatient: (typeof patients)[number];
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            placeholder="Enter Patient ID or Name..."
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-4 text-base outline-none transition focus:border-brand-500 focus:bg-white"
          />
        </div>
        <div className="mt-3 flex justify-end">
          <button onClick={onSearch} className="rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
            Search Patient
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{selectedPatient.name}</h2>
              <p className="text-sm text-slate-500">{selectedPatient.id} · {selectedPatient.primaryDx}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${riskTone(selectedPatient.risk)}`}>{selectedPatient.risk}%</span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-slate-600">
            <Info label="Age" value={`${selectedPatient.age}`} />
            <Info label="Gender" value={selectedPatient.gender} />
            <Info label="Primary Diagnosis" value={selectedPatient.primaryDx} full />
            <Info label="Readmission Risk" value={riskLabel(selectedPatient.risk)} full />
          </div>

          <div className="mt-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Historical Admission Timeline</h3>
            <div className="mt-3 space-y-3">
              {selectedPatient.timeline.map((entry) => (
                <div key={entry} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <div className="h-2.5 w-2.5 rounded-full bg-brand-600" />
                  {entry}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Explainable AI (SHAP)</h2>
              <p className="text-sm text-slate-500">Why the model produced this risk score</p>
            </div>
            <Brain className="h-5 w-5 text-brand-600" />
          </div>
          <div className="space-y-3">
            {selectedPatient.factors.map((factor) => (
              <div key={factor.label} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">{factor.label}</p>
                  <p className="text-sm text-slate-500">{factor.detail}</p>
                </div>
                <span className={`text-lg ${factor.direction === 'up' ? 'text-red-500' : 'text-emerald-500'}`}>
                  {factor.direction === 'up' ? '⬆️' : '⬇️'}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Info({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={`rounded-2xl bg-slate-50 p-4 ${full ? 'col-span-2' : ''}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

function PerformanceView() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-2xl font-semibold text-slate-900">Machine Learning Model Metrics (XGBoost)</h2>
        <p className="mt-1 text-sm text-slate-500">Threshold performance on the validation cohort.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {performanceStats.map((stat) => (
          <article key={stat.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{stat.value}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">ROC Curve</h3>
              <p className="text-sm text-slate-500">AUC score: 0.89</p>
            </div>
            <LineChart className="h-5 w-5 text-brand-600" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={rocData} margin={{ top: 8, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="fpr" name="False Positive Rate" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis dataKey="tpr" name="True Positive Rate" tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="tpr" stroke="#2563eb" strokeWidth={3} dot={false} />
                <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 1, y: 1 }]} stroke="#cbd5e1" strokeDasharray="5 5" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
          <h3 className="text-lg font-semibold text-slate-900">Classification Summary</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {metrics.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="text-sm font-medium text-slate-600">{label}</span>
                <span className="text-lg font-semibold text-slate-900">{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-sm text-slate-700">
            The model balances sensitivity for high-risk discharges while keeping avoidable alerts under control.
          </div>
        </section>
      </div>
    </div>
  );
}

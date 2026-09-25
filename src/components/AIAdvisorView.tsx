import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Send,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  PieChart,
} from 'lucide-react';
import { CurrencyCode, FinanceData } from '../types/finance';
import { calculateMetrics } from '../utils/calculations';
import { formatCurrency } from '../utils/storage';
import { generateBotResponse, generateRecommendations } from '../utils/advisorEngine';

interface AIAdvisorViewProps {
  data: FinanceData;
  currency: CurrencyCode;
}

interface ChatEntry {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
}

export const AIAdvisorView: React.FC<AIAdvisorViewProps> = ({ data, currency }) => {
  const metrics = calculateMetrics(data);
  const recommendations = generateRecommendations(data);

  // Chatbot conversation state
  const [messages, setMessages] = useState<ChatEntry[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: `Hello! I'm your Personal Finance Advisor Bot. I analyze your recorded income, expenses, and budget in real time to share educational budgeting tips.\n\nHow can I help you today? You can choose a quick question below or ask me anything about your current budget or spending patterns!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const suggestedPrompts = [
    'How are my food expenses looking?',
    'Am I close to my monthly budget limit?',
    'How can I optimize my savings this month?',
    'Explain the 50/30/20 rule with my actual numbers',
    'What is my single highest expense category?',
  ];

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg: ChatEntry = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');

    setIsTyping(true);
    setTimeout(() => {
      const botReply = generateBotResponse(query, data);
      const botMsg: ChatEntry = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 450);
  };

  const rule = metrics.rule50_30_20;

  return (
    <div className="space-y-6">
      {/* Prominent Educational Disclaimer Banner */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-4 shadow-2xs">
        <div className="flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <span className="font-bold">Educational Purpose Disclaimer:</span> This application is
            an educational budgeting tool and does not provide professional financial advice,
            stock recommendations, crypto forecasts, or investment management. All suggestions are
            heuristic observations derived from your self-reported budget, income, and expense records.
          </div>
        </div>
      </div>

      {/* Dynamic Rule-Based Analysis Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              Automated Financial Health Insights
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            {recommendations.length} {recommendations.length === 1 ? 'alert' : 'alerts'} generated
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec) => {
            const isWarning = rec.type === 'warning';
            const isSuccess = rec.type === 'success';

            return (
              <div
                key={rec.id}
                className={`rounded-xl p-4.5 border transition-all shadow-2xs ${
                  isWarning
                    ? 'border-amber-200 bg-amber-50/50'
                    : isSuccess
                    ? 'border-emerald-200 bg-emerald-50/40'
                    : 'border-slate-200/80 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {isWarning ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    ) : isSuccess ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Lightbulb className="w-4 h-4 text-sky-600 shrink-0" />
                    )}
                    <h4 className="text-xs font-bold text-slate-900">{rec.title}</h4>
                  </div>
                  {rec.metric && (
                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                      {rec.metric}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{rec.message}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 50/30/20 Rule Educational Framework */}
      <div className="rounded-xl bg-white p-5 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              The 50/30/20 Educational Budgeting Framework
            </h3>
            <p className="text-xs text-slate-500">
              Recommended allocation: 50% Needs, 30% Wants, 20% Savings
            </p>
          </div>
          <div className="text-xs text-slate-600 font-mono">
            Base Income: {formatCurrency(rule.income, currency)}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Needs */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/70 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800">1. Needs (Essentials)</span>
              <span className="font-mono text-slate-600">Target: 50%</span>
            </div>
            <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">
              {formatCurrency(rule.needs.amount, currency)}{' '}
              <span className="text-xs font-normal text-slate-500">
                ({rule.needs.percentage.toFixed(0)}%)
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Includes Food, Bills, Healthcare, Education, and Transit.
            </p>
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  rule.needs.percentage > 55 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, rule.needs.percentage)}%` }}
              />
            </div>
          </div>

          {/* Wants */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/70 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800">2. Wants (Discretionary)</span>
              <span className="font-mono text-slate-600">Target: 30%</span>
            </div>
            <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">
              {formatCurrency(rule.wants.amount, currency)}{' '}
              <span className="text-xs font-normal text-slate-500">
                ({rule.wants.percentage.toFixed(0)}%)
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Includes Shopping, Entertainment, and other leisure outlays.
            </p>
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  rule.wants.percentage > 35 ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, rule.wants.percentage)}%` }}
              />
            </div>
          </div>

          {/* Savings */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/70 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800">3. Savings & Surplus</span>
              <span className="font-mono text-slate-600">Target: 20%</span>
            </div>
            <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">
              {formatCurrency(rule.savings.amount, currency)}{' '}
              <span className="text-xs font-normal text-slate-500">
                ({rule.savings.percentage.toFixed(0)}%)
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Surplus allocated to safety buffer and active goal funding.
            </p>
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  rule.savings.percentage >= 20 ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(100, rule.savings.percentage)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Interactive AI Chatbot Section */}
      <div className="rounded-xl bg-white border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-xs">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold">Finance Advisor Bot</h4>
                <span className="inline-flex items-center text-[10px] bg-emerald-800/80 text-emerald-200 px-1.5 py-0.5 rounded font-medium">
                  Active
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Grounded in your active income, expense & savings data
              </p>
            </div>
          </div>
        </div>

        {/* Message Feed */}
        <div className="p-4 sm:p-5 space-y-4 max-h-96 overflow-y-auto bg-slate-50/40">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'bot' && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-emerald-600 text-white text-xs mt-1">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div
                className={`max-w-xl rounded-xl px-4 py-3 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-slate-900 text-white rounded-br-none shadow-xs'
                    : 'bg-white border border-slate-200/80 text-slate-800 rounded-bl-none shadow-2xs'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>
                <div
                  className={`mt-1.5 text-[10px] text-right ${
                    msg.sender === 'user' ? 'text-slate-400' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-2 items-center text-xs text-slate-500 py-1">
              <Bot className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>Advisor Bot is analyzing your financial records...</span>
            </div>
          )}
        </div>

        {/* Suggested Prompts */}
        <div className="p-3 border-t border-slate-100 bg-white">
          <p className="text-[11px] font-medium text-slate-500 mb-1.5">Quick Inquiries:</p>
          <div className="flex flex-wrap gap-1.5">
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSendMessage(prompt)}
                className="text-[11px] px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors text-left"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask for budgeting advice, spending trends, or savings tips..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 rounded-lg border border-slate-300 px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-800 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:pointer-events-none shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask Bot</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

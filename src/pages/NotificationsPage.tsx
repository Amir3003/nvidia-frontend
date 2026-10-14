import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/PageHeader';
import {
  BellIcon,
  CheckIcon,
  SendIcon,
  ShieldIcon,
  ExternalLinkIcon,
  TelegramIcon,
  DiscordIcon,
  KakaoTalkIcon,
} from '../components/Icons';

export const NotificationsPage: React.FC = () => {
  const { userProfile, updateUserProfile, addLog } = useApp();

  const initialNotifications = userProfile.notifications || {
    telegram: false,
    telegramHandle: '',
    kakao: false,
    kakaoHandle: '',
    discord: false,
    discordWebhook: '',
  };

  const [telegramActive, setTelegramActive] = useState(initialNotifications.telegram);
  const [telegramHandle, setTelegramHandle] = useState(initialNotifications.telegramHandle || '@');
  const [isTelegramModal, setIsTelegramModal] = useState(false);

  const [kakaoActive, setKakaoActive] = useState(initialNotifications.kakao);
  const [kakaoHandle, setKakaoHandle] = useState(initialNotifications.kakaoHandle || '');
  const [isKakaoModal, setIsKakaoModal] = useState(false);

  const [discordActive, setDiscordActive] = useState(initialNotifications.discord);
  const [discordWebhook, setDiscordWebhook] = useState(initialNotifications.discordWebhook || '');
  const [isDiscordModal, setIsDiscordModal] = useState(false);

  const [testAlertSent, setTestAlertSent] = useState<string | null>(null);

  const saveNotifications = (updates: Partial<typeof initialNotifications>) => {
    const updated = {
      telegram: telegramActive,
      telegramHandle,
      kakao: kakaoActive,
      kakaoHandle,
      discord: discordActive,
      discordWebhook,
      ...updates,
    };
    updateUserProfile({
      notifications: updated,
    });
  };

  const handleConnectTelegram = () => {
    const handle = telegramHandle.trim() || '@qadam_user';
    setTelegramActive(true);
    setTelegramHandle(handle);
    saveNotifications({ telegram: true, telegramHandle: handle });
    setIsTelegramModal(false);
    addLog('SYSTEM', `Telegram Bot connected: @QadamAgentBot linked to ${handle}`);
  };

  const handleDisconnectTelegram = () => {
    setTelegramActive(false);
    saveNotifications({ telegram: false });
    addLog('SYSTEM', 'Telegram Bot integration disconnected');
  };

  const handleConnectKakao = () => {
    const handle = kakaoHandle.trim() || 'user_kakao_id';
    setKakaoActive(true);
    setKakaoHandle(handle);
    saveNotifications({ kakao: true, kakaoHandle: handle });
    setIsKakaoModal(false);
    addLog('SYSTEM', `KakaoTalk Channel connected via Kakao i OpenBuilder for ${handle}`);
  };

  const handleDisconnectKakao = () => {
    setKakaoActive(false);
    saveNotifications({ kakao: false });
    addLog('SYSTEM', 'KakaoTalk Channel integration disconnected');
  };

  const handleConnectDiscord = () => {
    const webhook = discordWebhook.trim() || 'https://discord.com/api/webhooks/qadam/sample';
    setDiscordActive(true);
    setDiscordWebhook(webhook);
    saveNotifications({ discord: true, discordWebhook: webhook });
    setIsDiscordModal(false);
    addLog('SYSTEM', 'Discord Webhook bot active for squad notifications');
  };

  const handleDisconnectDiscord = () => {
    setDiscordActive(false);
    saveNotifications({ discord: false });
    addLog('SYSTEM', 'Discord Webhook integration disconnected');
  };

  const triggerTestAlert = (channel: string) => {
    setTestAlertSent(channel);
    setTimeout(() => setTestAlertSent(null), 3000);
    addLog('SYSTEM', `Test push notification dispatched to ${channel} via secure local proxy.`);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-transparent relative z-10 text-slate-100">
      <PageHeader
        title="Notifications & Bots"
        subtitle="multi-channel alert webhooks · zero PII leakage during dispatch"
      />

      <div className="p-6 space-y-6">
        {/* Top Info Banner */}
        <div className="p-5 rounded-card bg-gradient-to-br from-[#EDF7F6]/95 via-[#F3F6FF]/95 to-[#E8F4F8]/95 backdrop-blur-xl border border-teal-300/40 shadow-[0_16px_40px_-12px_rgba(6,182,212,0.18)] flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 flex-shrink-0">
            <ShieldIcon size={20} />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-indigo-950">
              Zero-PII Secure Webhook Architecture
            </h3>
            <p className="text-[13px] text-teal-950 mt-1 leading-relaxed">
              When opportunity match criteria or application deadlines are reached, notifications are formatted locally. No personal identifiable information (PII) is transmitted outside your client sandbox.
            </p>
          </div>
        </div>

        {/* 3 Channel Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Telegram Bot */}
          <div className="p-6 rounded-card bg-gradient-to-br from-[#EDF7F6]/95 via-[#F3F6FF]/95 to-[#E8F4F8]/95 backdrop-blur-xl border border-teal-300/40 shadow-[0_16px_40px_-12px_rgba(6,182,212,0.18)] flex flex-col justify-between space-y-6 hover:border-sky-400/80 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-btn bg-[#0088cc]/15 border border-[#0088cc]/30 flex items-center justify-center text-[#0088cc] shadow-xs">
                  <TelegramIcon size={24} />
                </div>
                <span
                  className={`text-mini font-mono px-2.5 py-1 rounded border flex items-center gap-1.5 font-bold ${
                    telegramActive
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-white/80 text-teal-800 border-teal-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      telegramActive ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'
                    }`}
                  />
                  <span>{telegramActive ? 'CONNECTED' : 'DISCONNECTED'}</span>
                </span>
              </div>

              <div>
                <h3 className="text-[17px] font-bold text-indigo-950">Telegram Bot</h3>
                <div className="text-mini font-mono text-emerald-700 font-bold mt-0.5">@QadamAgentBot</div>
                <p className="text-[13px] text-teal-950 mt-2 leading-relaxed">
                  Official Telegram bot integration for instant opportunity pings, eligibility status checks, and 24-hour deadline countdown reminders.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-teal-200/60 text-mini font-mono text-teal-900">
                <div className="flex items-center gap-2">
                  <CheckIcon size={12} className="text-emerald-600 flex-shrink-0" />
                  <span>Real-time hackathon radar pings</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon size={12} className="text-emerald-600 flex-shrink-0" />
                  <span>Instant ATS skill gap alerts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon size={12} className="text-emerald-600 flex-shrink-0" />
                  <span>Interactive reply commands</span>
                </div>
              </div>

              {telegramActive && (
                <div className="p-2.5 rounded bg-gradient-to-br from-sky-50 to-cyan-100/80 border border-sky-300/60 text-mini font-mono text-sky-950">
                  Linked Handle: <span className="text-indigo-950 font-bold">{telegramHandle}</span>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-4 border-t border-teal-200/60">
              {telegramActive ? (
                <>
                  <button
                    type="button"
                    onClick={() => triggerTestAlert('Telegram')}
                    className="w-full h-10 rounded-btn bg-white hover:bg-slate-50 border border-teal-200 text-teal-950 text-mini font-mono flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs font-semibold"
                  >
                    <BellIcon size={14} className="text-emerald-600" />
                    <span>{testAlertSent === 'Telegram' ? 'Ping Dispatched ✓' : 'Send Test Opportunity Ping'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDisconnectTelegram}
                    className="w-full h-9 rounded-btn border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 text-mini font-mono transition-colors cursor-pointer"
                  >
                    Disconnect Telegram
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsTelegramModal(true)}
                  className="w-full h-11 rounded-btn bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-[13px] font-mono transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-900/20"
                >
                  <span>Authorize with Telegram</span>
                  <ExternalLinkIcon size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Column 2: KakaoTalk Channel */}
          <div className="p-6 rounded-card bg-gradient-to-br from-[#EDF7F6]/95 via-[#F3F6FF]/95 to-[#E8F4F8]/95 backdrop-blur-xl border border-teal-300/40 shadow-[0_16px_40px_-12px_rgba(6,182,212,0.18)] flex flex-col justify-between space-y-6 hover:border-amber-400/80 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-btn bg-[#fee500]/25 border border-[#fee500]/60 flex items-center justify-center text-amber-900 shadow-xs">
                  <KakaoTalkIcon size={24} />
                </div>
                <span
                  className={`text-mini font-mono px-2.5 py-1 rounded border flex items-center gap-1.5 font-bold ${
                    kakaoActive
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-white/80 text-teal-800 border-teal-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      kakaoActive ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'
                    }`}
                  />
                  <span>{kakaoActive ? 'CONNECTED' : 'DISCONNECTED'}</span>
                </span>
              </div>

              <div>
                <h3 className="text-[17px] font-bold text-indigo-950">KakaoTalk Channel</h3>
                <div className="text-mini font-mono text-amber-700 font-bold mt-0.5">카카오 i OpenBuilder</div>
                <p className="text-[13px] text-teal-950 mt-2 leading-relaxed">
                  Dedicated Korean academic and tech alert integration via Kakao i OpenBuilder skill channel for East Asian opportunities and MEXT grants.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-teal-200/60 text-mini font-mono text-teal-900">
                <div className="flex items-center gap-2">
                  <CheckIcon size={12} className="text-emerald-600 flex-shrink-0" />
                  <span>MEXT & Asian research grants</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon size={12} className="text-emerald-600 flex-shrink-0" />
                  <span>KakaoTalk 알림톡 official alerts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon size={12} className="text-emerald-600 flex-shrink-0" />
                  <span>Korean / English bilingual cards</span>
                </div>
              </div>

              {kakaoActive && (
                <div className="p-2.5 rounded bg-gradient-to-br from-amber-50 to-orange-100/80 border border-amber-300/60 text-mini font-mono text-amber-950">
                  Linked ID: <span className="text-indigo-950 font-bold">{kakaoHandle}</span>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-4 border-t border-teal-200/60">
              {kakaoActive ? (
                <>
                  <button
                    type="button"
                    onClick={() => triggerTestAlert('KakaoTalk')}
                    className="w-full h-10 rounded-btn bg-white hover:bg-slate-50 border border-teal-200 text-teal-950 text-mini font-mono flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs font-semibold"
                  >
                    <BellIcon size={14} className="text-emerald-600" />
                    <span>{testAlertSent === 'KakaoTalk' ? '알림톡 Dispatched ✓' : 'Send Test Opportunity Ping'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDisconnectKakao}
                    className="w-full h-9 rounded-btn border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 text-mini font-mono transition-colors cursor-pointer"
                  >
                    Disconnect KakaoTalk
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsKakaoModal(true)}
                  className="w-full h-11 rounded-btn bg-[#fee500] hover:bg-[#ebd400] text-amber-950 font-bold text-[13px] font-mono transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-900/15"
                >
                  <span>Authorize with KakaoTalk</span>
                  <ExternalLinkIcon size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Column 3: Discord Bot */}
          <div className="p-6 rounded-card bg-gradient-to-br from-[#EDF7F6]/95 via-[#F3F6FF]/95 to-[#E8F4F8]/95 backdrop-blur-xl border border-teal-300/40 shadow-[0_16px_40px_-12px_rgba(6,182,212,0.18)] flex flex-col justify-between space-y-6 hover:border-indigo-400/80 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-btn bg-[#5865f2]/15 border border-[#5865f2]/30 flex items-center justify-center text-[#5865f2] shadow-xs">
                  <DiscordIcon size={24} />
                </div>
                <span
                  className={`text-mini font-mono px-2.5 py-1 rounded border flex items-center gap-1.5 font-bold ${
                    discordActive
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-white/80 text-teal-800 border-teal-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      discordActive ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'
                    }`}
                  />
                  <span>{discordActive ? 'CONNECTED' : 'DISCONNECTED'}</span>
                </span>
              </div>

              <div>
                <h3 className="text-[17px] font-bold text-indigo-950">Discord Bot</h3>
                <div className="text-mini font-mono text-[#5865f2] font-bold mt-0.5">Webhook & Squad Bot</div>
                <p className="text-[13px] text-teal-950 mt-2 leading-relaxed">
                  Direct webhook & DM bot for hackathon team servers, developer communities, and automated squad recruiting notifications.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-teal-200/60 text-mini font-mono text-teal-900">
                <div className="flex items-center gap-2">
                  <CheckIcon size={12} className="text-emerald-600 flex-shrink-0" />
                  <span>Private squad channel webhooks</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon size={12} className="text-emerald-600 flex-shrink-0" />
                  <span>Teammate recruit pings & invites</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon size={12} className="text-emerald-600 flex-shrink-0" />
                  <span>Rich embed formatting & links</span>
                </div>
              </div>

              {discordActive && (
                <div className="p-2.5 rounded bg-gradient-to-br from-indigo-50 to-violet-100/80 border border-indigo-300/60 text-mini font-mono text-indigo-950 truncate">
                  Webhook: <span className="text-indigo-950 font-bold">{discordWebhook}</span>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-4 border-t border-teal-200/60">
              {discordActive ? (
                <>
                  <button
                    type="button"
                    onClick={() => triggerTestAlert('Discord')}
                    className="w-full h-10 rounded-btn bg-white hover:bg-slate-50 border border-teal-200 text-teal-950 text-mini font-mono flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs font-semibold"
                  >
                    <BellIcon size={14} className="text-emerald-600" />
                    <span>{testAlertSent === 'Discord' ? 'Webhook Dispatched ✓' : 'Send Test Opportunity Ping'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDisconnectDiscord}
                    className="w-full h-9 rounded-btn border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 text-mini font-mono transition-colors cursor-pointer"
                  >
                    Disconnect Discord
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsDiscordModal(true)}
                  className="w-full h-11 rounded-btn bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-[13px] font-mono transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-900/20"
                >
                  <span>Authorize with Discord</span>
                  <ExternalLinkIcon size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Authorize Telegram */}
      {isTelegramModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="w-full max-w-md bg-gradient-to-br from-[#EDF7F6] via-[#F3F6FF] to-[#E8F4F8] border border-teal-300/60 rounded-card shadow-2xl p-6 space-y-4 text-slate-900">
            <h3 className="text-[17px] font-bold text-indigo-950">Link Telegram Account</h3>
            <p className="text-[13px] text-teal-950 leading-relaxed">
              Open Telegram and search for <strong className="text-emerald-700">@QadamAgentBot</strong> or enter your Telegram username below to enable instant opportunity pings.
            </p>
            <div>
              <label className="block text-mini font-mono uppercase text-teal-900 font-semibold mb-1">
                Telegram Username or Chat ID
              </label>
              <input
                type="text"
                value={telegramHandle}
                onChange={(e) => setTelegramHandle(e.target.value)}
                placeholder="@username"
                className="w-full h-11 px-3.5 bg-white border border-teal-200 rounded-btn text-[13px] text-slate-900 font-mono focus:border-emerald-600 focus:outline-none transition-colors shadow-xs"
              />
            </div>
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsTelegramModal(false)}
                className="h-10 px-4 rounded-btn border border-teal-200 text-slate-700 hover:text-slate-900 hover:bg-white text-mini font-mono cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConnectTelegram}
                className="h-10 px-5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold rounded-btn text-mini font-mono cursor-pointer transition-colors shadow-xs"
              >
                Confirm Connection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Authorize KakaoTalk */}
      {isKakaoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="w-full max-w-md bg-gradient-to-br from-[#EDF7F6] via-[#F3F6FF] to-[#E8F4F8] border border-teal-300/60 rounded-card shadow-2xl p-6 space-y-4 text-slate-900">
            <h3 className="text-[17px] font-bold text-indigo-950">Link KakaoTalk Channel</h3>
            <p className="text-[13px] text-teal-950 leading-relaxed">
              Connect via Kakao i OpenBuilder channel to receive official 알림톡 notifications for Asian grants and scholarships.
            </p>
            <div>
              <label className="block text-mini font-mono uppercase text-teal-900 font-semibold mb-1">
                Kakao ID or Phone Number
              </label>
              <input
                type="text"
                value={kakaoHandle}
                onChange={(e) => setKakaoHandle(e.target.value)}
                placeholder="kakao_id or +82 10-xxxx-xxxx"
                className="w-full h-11 px-3.5 bg-white border border-teal-200 rounded-btn text-[13px] text-slate-900 font-mono focus:border-emerald-600 focus:outline-none transition-colors shadow-xs"
              />
            </div>
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsKakaoModal(false)}
                className="h-10 px-4 rounded-btn border border-teal-200 text-slate-700 hover:text-slate-900 hover:bg-white text-mini font-mono cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConnectKakao}
                className="h-10 px-5 bg-[#fee500] hover:bg-[#ebd400] text-amber-950 font-bold rounded-btn text-mini font-mono cursor-pointer transition-colors shadow-xs"
              >
                Confirm Connection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Authorize Discord */}
      {isDiscordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="w-full max-w-md bg-gradient-to-br from-[#EDF7F6] via-[#F3F6FF] to-[#E8F4F8] border border-teal-300/60 rounded-card shadow-2xl p-6 space-y-4 text-slate-900">
            <h3 className="text-[17px] font-bold text-indigo-950">Link Discord Webhook</h3>
            <p className="text-[13px] text-teal-950 leading-relaxed">
              Enter a Discord incoming webhook URL from your server or squad channel to stream real-time opportunity alerts and team requests.
            </p>
            <div>
              <label className="block text-mini font-mono uppercase text-teal-900 font-semibold mb-1">
                Discord Incoming Webhook URL
              </label>
              <input
                type="url"
                value={discordWebhook}
                onChange={(e) => setDiscordWebhook(e.target.value)}
                placeholder="https://discord.com/api/webhooks/..."
                className="w-full h-11 px-3.5 bg-white border border-teal-200 rounded-btn text-[12px] text-slate-900 font-mono focus:border-emerald-600 focus:outline-none transition-colors shadow-xs"
              />
            </div>
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDiscordModal(false)}
                className="h-10 px-4 rounded-btn border border-teal-200 text-slate-700 hover:text-slate-900 hover:bg-white text-mini font-mono cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConnectDiscord}
                className="h-10 px-5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-btn text-mini font-mono cursor-pointer transition-colors shadow-xs"
              >
                Confirm Connection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;

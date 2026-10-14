import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/PageHeader';
import {
  BellIcon,
  CheckIcon,
  SendIcon,
  ShieldIcon,
  ExternalLinkIcon,
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
    addLog(
      'MODEL',
      `[MESSENGER DISPATCH] Push notification triggered via ${channel}: "Nebius x NVIDIA Hackathon closes in 48 hours. 94% stack match."`
    );
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <PageHeader
        title="Mobile & Messenger Alerts"
        subtitle="Receive Real-Time Opportunity Alerts on Your Phone · Multi-Channel Sovereign Delivery"
      />

      <div className="p-6 space-y-6">
        {/* Security Banner */}
        <div className="p-4 rounded-card bg-surface border border-border flex items-start gap-3.5">
          <ShieldIcon size={18} className="text-accent flex-shrink-0 mt-0.5" />
          <div className="text-[13px] leading-relaxed">
            <span className="font-semibold text-text">Zero-Leak Alert Routing: </span>
            <span className="text-muted">
              Notifications contain only verified opportunity metadata, eligibility checklist tags, and deadline countdowns. Your CV contents, private keys, and passwords remain strictly isolated inside your local device sandbox.
            </span>
          </div>
        </div>

        {/* 3 Large, Symmetrical Vertical Feature Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Telegram Bot */}
          <div className="p-6 rounded-card bg-surface border border-border flex flex-col justify-between space-y-6 hover:border-zinc-700 transition-colors">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-btn bg-[#0088cc]/10 border border-[#0088cc]/30 flex items-center justify-center text-[#0088cc]">
                  <SendIcon size={18} />
                </div>
                <span
                  className={`text-mini font-mono px-2.5 py-1 rounded border flex items-center gap-1.5 ${
                    telegramActive
                      ? 'bg-accent/10 text-accent border-accent-border'
                      : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      telegramActive ? 'bg-accent animate-pulse' : 'bg-zinc-600'
                    }`}
                  />
                  <span>{telegramActive ? 'CONNECTED' : 'DISCONNECTED'}</span>
                </span>
              </div>

              <div>
                <h3 className="text-[17px] font-semibold text-text">Telegram Bot</h3>
                <div className="text-mini font-mono text-accent mt-0.5">@QadamAgentBot</div>
                <p className="text-[13px] text-muted mt-2 leading-relaxed">
                  Official Telegram bot integration for instant opportunity pings, eligibility status checks, and 24-hour deadline countdown reminders.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-border/60 text-mini font-mono text-zinc-300">
                <div className="flex items-center gap-2">
                  <CheckIcon size={12} className="text-accent flex-shrink-0" />
                  <span>Real-time hackathon radar pings</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon size={12} className="text-accent flex-shrink-0" />
                  <span>Instant ATS skill gap alerts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon size={12} className="text-accent flex-shrink-0" />
                  <span>Interactive reply commands</span>
                </div>
              </div>

              {telegramActive && (
                <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 text-mini font-mono text-muted">
                  Linked Handle: <span className="text-zinc-100">{telegramHandle}</span>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-4 border-t border-border">
              {telegramActive ? (
                <>
                  <button
                    type="button"
                    onClick={() => triggerTestAlert('Telegram')}
                    className="w-full h-10 rounded-btn bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 text-mini font-mono flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <BellIcon size={14} className="text-accent" />
                    <span>{testAlertSent === 'Telegram' ? 'Ping Dispatched ✓' : 'Send Test Opportunity Ping'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDisconnectTelegram}
                    className="w-full h-9 rounded-btn border border-red-500/30 text-red-400 hover:bg-red-500/10 text-mini font-mono transition-colors cursor-pointer"
                  >
                    Disconnect Telegram
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsTelegramModal(true)}
                  className="w-full h-11 rounded-btn bg-accent hover:bg-emerald-500 text-zinc-950 font-semibold text-[13px] font-mono transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Authorize with Telegram</span>
                  <ExternalLinkIcon size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Column 2: KakaoTalk Channel */}
          <div className="p-6 rounded-card bg-surface border border-border flex flex-col justify-between space-y-6 hover:border-zinc-700 transition-colors">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-btn bg-[#fee500]/10 border border-[#fee500]/30 flex items-center justify-center text-[#fee500]">
                  <span className="font-bold font-sans text-[18px]">talk</span>
                </div>
                <span
                  className={`text-mini font-mono px-2.5 py-1 rounded border flex items-center gap-1.5 ${
                    kakaoActive
                      ? 'bg-accent/10 text-accent border-accent-border'
                      : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      kakaoActive ? 'bg-accent animate-pulse' : 'bg-zinc-600'
                    }`}
                  />
                  <span>{kakaoActive ? 'CONNECTED' : 'DISCONNECTED'}</span>
                </span>
              </div>

              <div>
                <h3 className="text-[17px] font-semibold text-text">KakaoTalk Channel</h3>
                <div className="text-mini font-mono text-[#fee500] mt-0.5">카카오 i OpenBuilder</div>
                <p className="text-[13px] text-muted mt-2 leading-relaxed">
                  Dedicated Korean academic and tech alert integration via Kakao i OpenBuilder skill channel for East Asian opportunities and MEXT grants.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-border/60 text-mini font-mono text-zinc-300">
                <div className="flex items-center gap-2">
                  <CheckIcon size={12} className="text-accent flex-shrink-0" />
                  <span>MEXT & Asian research grants</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon size={12} className="text-accent flex-shrink-0" />
                  <span>KakaoTalk 알림톡 official alerts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon size={12} className="text-accent flex-shrink-0" />
                  <span>Korean / English bilingual cards</span>
                </div>
              </div>

              {kakaoActive && (
                <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 text-mini font-mono text-muted">
                  Linked ID: <span className="text-zinc-100">{kakaoHandle}</span>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-4 border-t border-border">
              {kakaoActive ? (
                <>
                  <button
                    type="button"
                    onClick={() => triggerTestAlert('KakaoTalk')}
                    className="w-full h-10 rounded-btn bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 text-mini font-mono flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <BellIcon size={14} className="text-accent" />
                    <span>{testAlertSent === 'KakaoTalk' ? '알림톡 Dispatched ✓' : 'Send Test Opportunity Ping'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDisconnectKakao}
                    className="w-full h-9 rounded-btn border border-red-500/30 text-red-400 hover:bg-red-500/10 text-mini font-mono transition-colors cursor-pointer"
                  >
                    Disconnect KakaoTalk
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsKakaoModal(true)}
                  className="w-full h-11 rounded-btn bg-[#fee500] hover:bg-[#ebd400] text-zinc-950 font-semibold text-[13px] font-mono transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Authorize with KakaoTalk</span>
                  <ExternalLinkIcon size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Column 3: Discord Bot */}
          <div className="p-6 rounded-card bg-surface border border-border flex flex-col justify-between space-y-6 hover:border-zinc-700 transition-colors">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-btn bg-[#5865f2]/10 border border-[#5865f2]/30 flex items-center justify-center text-[#5865f2]">
                  <span className="font-bold font-mono text-[16px]">DC</span>
                </div>
                <span
                  className={`text-mini font-mono px-2.5 py-1 rounded border flex items-center gap-1.5 ${
                    discordActive
                      ? 'bg-accent/10 text-accent border-accent-border'
                      : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      discordActive ? 'bg-accent animate-pulse' : 'bg-zinc-600'
                    }`}
                  />
                  <span>{discordActive ? 'CONNECTED' : 'DISCONNECTED'}</span>
                </span>
              </div>

              <div>
                <h3 className="text-[17px] font-semibold text-text">Discord Bot</h3>
                <div className="text-mini font-mono text-[#5865f2] mt-0.5">Webhook & Squad Bot</div>
                <p className="text-[13px] text-muted mt-2 leading-relaxed">
                  Direct webhook & DM bot for hackathon team servers, developer communities, and automated squad recruiting notifications.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-border/60 text-mini font-mono text-zinc-300">
                <div className="flex items-center gap-2">
                  <CheckIcon size={12} className="text-accent flex-shrink-0" />
                  <span>Private squad channel webhooks</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon size={12} className="text-accent flex-shrink-0" />
                  <span>Teammate recruit pings & invites</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon size={12} className="text-accent flex-shrink-0" />
                  <span>Rich embed formatting & links</span>
                </div>
              </div>

              {discordActive && (
                <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 text-mini font-mono text-muted truncate">
                  Webhook: <span className="text-zinc-100">{discordWebhook}</span>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-4 border-t border-border">
              {discordActive ? (
                <>
                  <button
                    type="button"
                    onClick={() => triggerTestAlert('Discord')}
                    className="w-full h-10 rounded-btn bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 text-mini font-mono flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <BellIcon size={14} className="text-accent" />
                    <span>{testAlertSent === 'Discord' ? 'Webhook Dispatched ✓' : 'Send Test Opportunity Ping'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDisconnectDiscord}
                    className="w-full h-9 rounded-btn border border-red-500/30 text-red-400 hover:bg-red-500/10 text-mini font-mono transition-colors cursor-pointer"
                  >
                    Disconnect Discord
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsDiscordModal(true)}
                  className="w-full h-11 rounded-btn bg-[#5865f2] hover:bg-[#4752c4] text-white font-semibold text-[13px] font-mono transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090b]/90 backdrop-blur-sm">
          <div className="w-full max-w-md bg-surface border border-zinc-700 rounded-card shadow-2xl p-6 space-y-4">
            <h3 className="text-[17px] font-semibold text-text">Link Telegram Account</h3>
            <p className="text-[13px] text-muted leading-relaxed">
              Open Telegram and search for <strong className="text-accent">@QadamAgentBot</strong> or enter your Telegram username below to enable instant opportunity pings.
            </p>
            <div>
              <label className="block text-mini font-mono uppercase text-muted-2 mb-1">
                Telegram Username or Chat ID
              </label>
              <input
                type="text"
                value={telegramHandle}
                onChange={(e) => setTelegramHandle(e.target.value)}
                placeholder="@username"
                className="w-full h-11 px-3.5 bg-sidebar border border-border rounded-btn text-[13px] text-text font-mono focus:border-accent focus:outline-none"
              />
            </div>
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsTelegramModal(false)}
                className="h-10 px-4 rounded-btn border border-border text-muted hover:text-text text-mini font-mono cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConnectTelegram}
                className="h-10 px-5 bg-accent hover:bg-emerald-500 text-zinc-950 font-semibold rounded-btn text-mini font-mono cursor-pointer"
              >
                Confirm Connection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Authorize KakaoTalk */}
      {isKakaoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090b]/90 backdrop-blur-sm">
          <div className="w-full max-w-md bg-surface border border-zinc-700 rounded-card shadow-2xl p-6 space-y-4">
            <h3 className="text-[17px] font-semibold text-text">Link KakaoTalk Channel</h3>
            <p className="text-[13px] text-muted leading-relaxed">
              Connect via Kakao i OpenBuilder channel to receive official 알림톡 notifications for Asian grants and scholarships.
            </p>
            <div>
              <label className="block text-mini font-mono uppercase text-muted-2 mb-1">
                Kakao ID or Phone Number
              </label>
              <input
                type="text"
                value={kakaoHandle}
                onChange={(e) => setKakaoHandle(e.target.value)}
                placeholder="kakao_id or +82 10-xxxx-xxxx"
                className="w-full h-11 px-3.5 bg-sidebar border border-border rounded-btn text-[13px] text-text font-mono focus:border-accent focus:outline-none"
              />
            </div>
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsKakaoModal(false)}
                className="h-10 px-4 rounded-btn border border-border text-muted hover:text-text text-mini font-mono cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConnectKakao}
                className="h-10 px-5 bg-[#fee500] hover:bg-[#ebd400] text-zinc-950 font-semibold rounded-btn text-mini font-mono cursor-pointer"
              >
                Confirm Connection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Authorize Discord */}
      {isDiscordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090b]/90 backdrop-blur-sm">
          <div className="w-full max-w-md bg-surface border border-zinc-700 rounded-card shadow-2xl p-6 space-y-4">
            <h3 className="text-[17px] font-semibold text-text">Link Discord Webhook</h3>
            <p className="text-[13px] text-muted leading-relaxed">
              Enter a Discord incoming webhook URL from your server or squad channel to stream real-time opportunity alerts and team requests.
            </p>
            <div>
              <label className="block text-mini font-mono uppercase text-muted-2 mb-1">
                Discord Incoming Webhook URL
              </label>
              <input
                type="url"
                value={discordWebhook}
                onChange={(e) => setDiscordWebhook(e.target.value)}
                placeholder="https://discord.com/api/webhooks/..."
                className="w-full h-11 px-3.5 bg-sidebar border border-border rounded-btn text-[12px] text-text font-mono focus:border-accent focus:outline-none"
              />
            </div>
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDiscordModal(false)}
                className="h-10 px-4 rounded-btn border border-border text-muted hover:text-text text-mini font-mono cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConnectDiscord}
                className="h-10 px-5 bg-[#5865f2] hover:bg-[#4752c4] text-white font-semibold rounded-btn text-mini font-mono cursor-pointer"
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


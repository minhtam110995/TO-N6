import React, { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallButton: React.FC<{ variant?: 'header' | 'button' }> = ({ variant = 'header' }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // General feedback
      alert('Để cài đặt ứng dụng: hãy nhấn vào biểu tượng Cài đặt trên thanh địa chỉ của trình duyệt hoặc menu "Thêm vào màn hình chính".');
    }
  };

  if (isInstalled) {
    return null;
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        className={
          variant === 'header'
            ? 'hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold text-xs hover:bg-emerald-100 transition'
            : 'w-full py-2.5 px-3 rounded-xl bg-primary text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm'
        }
        title="Cài đặt web app lên điện thoại hoặc máy tính"
      >
        <span className="material-symbols-outlined text-base">download_for_offline</span>
        <span>Cài đặt ứng dụng PWA</span>
      </button>

      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">add_to_home_screen</span>
            </div>
            <h3 className="font-bold text-lg text-slate-900">Cài đặt Toán 6 trên iPhone / iPad</h3>
            <div className="text-sm text-slate-600 text-left space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <p>1. Nhấn vào nút <strong>Chia sẻ (Share)</strong> ở thanh dưới cùng của Safari.</p>
              <p>2. Cuộn xuống và chọn <strong>"Thêm vào Màn hình chính" (Add to Home Screen)</strong>.</p>
              <p>3. Nhấn <strong>"Thêm" (Add)</strong> ở góc trên bên phải.</p>
            </div>
            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-blue-700"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </>
  );
};

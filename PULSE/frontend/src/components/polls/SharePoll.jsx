import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Copy,
  Check,
  Share2,
  Download,
  Wifi,
  Globe,
  Laptop,
  Smartphone,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';
import api from '../../services/api';

export function SharePoll({ pollId, question }) {
  const [copied, setCopied] = useState(false);
  const [lanIp, setLanIp] = useState('');
  const [activeTab, setActiveTab] = useState('wifi'); // 'wifi' | 'public' | 'local'
  const [customTunnel, setCustomTunnel] = useState(() => {
    return localStorage.getItem('pulse_tunnel_url') || 'https://number-fotos-interior-appraisal.trycloudflare.com';
  });

  // Fetch local network info from backend
  useEffect(() => {
    let isMounted = true;
    api
      .get('/api/system/network-info')
      .then((res) => {
        if (isMounted) {
          if (res.data?.lan_ip && res.data.lan_ip !== '127.0.0.1') {
            setLanIp(res.data.lan_ip);
          }
          if (res.data?.public_url && !localStorage.getItem('pulse_tunnel_url')) {
            setCustomTunnel(res.data.public_url);
          }
        }
      })
      .catch((err) => {
        console.warn('Network info discovery:', err.message);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const saveCustomTunnel = (val) => {
    const clean = val.trim().replace(/\/$/, '');
    setCustomTunnel(clean);
    if (clean) {
      localStorage.setItem('pulse_tunnel_url', clean);
    } else {
      localStorage.removeItem('pulse_tunnel_url');
    }
  };

  // Determine active share URL
  const port = window.location.port ? `:${window.location.port}` : '';
  const detectedLanUrl = lanIp ? `http://${lanIp}${port}` : window.location.origin;
  const localhostUrl = `http://localhost${port}`;

  let shareUrl = `${detectedLanUrl}/poll/${pollId}`;
  if (activeTab === 'local') {
    shareUrl = `${localhostUrl}/poll/${pollId}`;
  } else if (activeTab === 'public' && customTunnel) {
    shareUrl = `${customTunnel}/poll/${pollId}`;
  } else if (activeTab === 'wifi') {
    // If user is already accessing via LAN IP or public domain, use origin
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      shareUrl = `${window.location.origin}/poll/${pollId}`;
    } else {
      shareUrl = `${detectedLanUrl}/poll/${pollId}`;
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById(`poll-qr-code-${pollId || 'main'}`);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `PULSE-poll-${pollId}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-base">
          <Share2 className="w-5 h-5 text-pulse-500" />
          <span>Share Interactive Poll</span>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-pulse-50 dark:bg-pulse-950/60 text-pulse-600 dark:text-pulse-400 font-semibold border border-pulse-200 dark:border-pulse-900/60">
          Real-Time Live
        </span>
      </div>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-navy-800/80 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('wifi')}
          className={`flex items-center justify-center space-x-1.5 py-2 px-2 rounded-lg transition-all ${
            activeTab === 'wifi'
              ? 'bg-white dark:bg-navy-700 text-pulse-600 dark:text-pulse-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Wifi className="w-3.5 h-3.5" />
          <span className="truncate">Wi-Fi Friends</span>
        </button>

        <button
          onClick={() => setActiveTab('public')}
          className={`flex items-center justify-center space-x-1.5 py-2 px-2 rounded-lg transition-all ${
            activeTab === 'public'
              ? 'bg-white dark:bg-navy-700 text-pulse-600 dark:text-pulse-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span className="truncate">Worldwide / Web</span>
        </button>

        <button
          onClick={() => setActiveTab('local')}
          className={`flex items-center justify-center space-x-1.5 py-2 px-2 rounded-lg transition-all ${
            activeTab === 'local'
              ? 'bg-white dark:bg-navy-700 text-pulse-600 dark:text-pulse-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Laptop className="w-3.5 h-3.5" />
          <span className="truncate">Localhost</span>
        </button>
      </div>

      {/* Description banner for selected tab */}
      {activeTab === 'wifi' && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-start space-x-2">
          <Smartphone className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div>
            <p className="font-semibold">Share with anyone on your Wi-Fi or Phone Hotspot</p>
            <p className="text-[11px] opacity-90 mt-0.5">
              Friends connected to the same Wi-Fi can scan the QR code with their phone camera or open this link to vote immediately!
            </p>
          </div>
        </div>
      )}

      {activeTab === 'public' && (
        <div className="space-y-3 p-3.5 rounded-xl bg-pulse-50/70 dark:bg-navy-800/60 border border-pulse-200 dark:border-navy-700 text-xs">
          <div className="flex items-start space-x-2 text-pulse-900 dark:text-pulse-200">
            <Globe className="w-4 h-4 mt-0.5 flex-shrink-0 text-pulse-600" />
            <div>
              <p className="font-semibold">Share across the Internet (Mobile 4G/5G, Remote Friends)</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                Paste your Cloudflare, ngrok, or Pinggy tunnel URL below to generate a global link.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="url"
              placeholder="e.g. https://pulse-live.loca.lt or https://*.pinggy.link"
              value={customTunnel}
              onChange={(e) => saveCustomTunnel(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-900 text-xs text-slate-800 dark:text-slate-200 font-mono"
            />
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            💡 Quick terminal command to create a free instant public URL:{' '}
            <code className="px-1.5 py-0.5 bg-slate-200 dark:bg-navy-900 rounded font-mono text-pulse-600 dark:text-pulse-400 select-all">
              ssh -p 443 -R0:localhost:5173 a.pinggy.io
            </code>
          </p>
        </div>
      )}

      {activeTab === 'local' && (
        <div className="p-3 rounded-xl bg-slate-100 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-xs text-slate-700 dark:text-slate-300 flex items-start space-x-2">
          <Laptop className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-500" />
          <div>
            <p className="font-semibold">Local Computer Testing</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Use this link to test in another browser tab on this computer.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* QR Code Container */}
        <div className="p-3 bg-white rounded-2xl shadow-inner border border-slate-200 flex flex-col items-center">
          <QRCodeSVG
            id={`poll-qr-code-${pollId || 'main'}`}
            value={shareUrl}
            size={140}
            level="H"
            includeMargin={true}
          />
          <button
            onClick={handleDownloadQR}
            className="mt-2 text-[11px] font-semibold text-slate-500 hover:text-pulse-600 flex items-center space-x-1"
          >
            <Download className="w-3 h-3" />
            <span>Download QR</span>
          </button>
        </div>

        {/* Share Details */}
        <div className="flex-1 space-y-3 w-full">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Shareable Direct Link
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
              <span>Ready to Vote</span>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-xs font-mono text-slate-700 dark:text-slate-300 select-all"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 rounded-xl bg-pulse-600 hover:bg-pulse-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-md shadow-pulse-500/20 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Social Links */}
          <div className="flex items-center space-x-2 pt-2">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`🗳️ Cast your vote now on PULSE: "${question}" \n${shareUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Share on WhatsApp</span>
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Vote in real time on PULSE: ${question}`)}&url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-navy-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors"
            >
              Share on X
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SharePoll;

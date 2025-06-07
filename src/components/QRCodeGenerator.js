import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import { FiDownload, FiSettings, FiX, FiImage, FiDroplet, FiEye, FiZap, FiLink, FiRefreshCw, FiCopy, FiTrash2, FiSave, FiFolder } from 'react-icons/fi';
import DataTypeTabs from './DataTypeTabs';
import { TextInput, WifiInput, VCardInput, EmailInput, SmsInput, GeoInput } from './InputForms';

// Default values for the "Reset" function
const DEFAULTS = {
    size: 256,
    fgColor: '#FFFFFF',
    bgColor: 'transparent',
    level: 'M',
    qrStyle: 'squares',
    eyeRadius: '0',
    enableGradient: false,
    gradientStart: '#8a2be2',
    gradientEnd: '#4c00ff',
    gradientDirection: 'vertical',
};

// Toast notification component
const Toast = ({ message, show }) => (
    <div className={`toast-notification ${show ? 'show' : ''}`}>{message}</div>
);

// Fallback function for copying text
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
    } catch (err) {
        document.body.removeChild(textArea);
        return false;
    }
}

const DataOverview = ({ value }) => (
    <div className="qr-data-overview">
        <p>{value}</p>
    </div>
);

const QRCodeGenerator = () => {
    const [qrType, setQrType] = useState('text');
    const [showOptions, setShowOptions] = useState(false);
    const [downloadFormat, setDownloadFormat] = useState('png');
    const [toast, setToast] = useState({ show: false, message: '' });
    const [isQrVisible, setIsQrVisible] = useState(true);
    const [textValue, setTextValue] = useState('https://reactjs.org');
    const [wifiData, setWifiData] = useState({ ssid: '', password: '', encryption: 'WPA' });
    const [vCardData, setVCardData] = useState({ name: '', phone: '', email: '', org: '' });
    const [emailData, setEmailData] = useState({ email: '', subject: '', body: '' });
    const [smsData, setSmsData] = useState({ phone: '', message: '' });
    const [geoData, setGeoData] = useState({ latitude: '', longitude: '' });
    const [size, setSize] = useState(DEFAULTS.size);
    const [fgColor, setFgColor] = useState(DEFAULTS.fgColor);
    const [bgColor, setBgColor] = useState(DEFAULTS.bgColor);
    const [level, setLevel] = useState(DEFAULTS.level);
    const [qrStyle, setQrStyle] = useState(DEFAULTS.qrStyle);
    const [eyeRadius, setEyeRadius] = useState(DEFAULTS.eyeRadius);
    const [enableGradient, setEnableGradient] = useState(DEFAULTS.enableGradient);
    const [gradientStart, setGradientStart] = useState(DEFAULTS.gradientStart);
    const [gradientEnd, setGradientEnd] = useState(DEFAULTS.gradientEnd);
    const [gradientDirection, setGradientDirection] = useState(DEFAULTS.gradientDirection);
    const [logoImage, setLogoImage] = useState(null);
    const [logoDimensions, setLogoDimensions] = useState({ width: 40, height: 40 });
    const [templates, setTemplates] = useState(() => {
        try {
            const saved = localStorage.getItem('qrStyleTemplates');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error("Could not parse saved templates", error);
            return [];
        }
    });

    const showToast = useCallback((message) => {
        setToast({ message, show: true });
        setTimeout(() => setToast({ message: '', show: false }), 3000);
    }, []);

    const qrValue = useMemo(() => {
        switch (qrType) {
            case 'wifi':
                if (!wifiData.ssid) return '';
                return `WIFI:T:${wifiData.encryption};S:${wifiData.ssid};P:${wifiData.password};;`;
            case 'vcard':
                if (!vCardData.name || (!vCardData.phone && !vCardData.email)) return '';
                return `BEGIN:VCARD\nVERSION:3.0\nN:${vCardData.name}\nFN:${vCardData.name}\nORG:${vCardData.org}\nTEL;TYPE=WORK,VOICE:${vCardData.phone}\nEMAIL:${vCardData.email}\nEND:VCARD`;
            case 'email':
                if (!emailData.email) return '';
                return `mailto:${emailData.email}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
            case 'sms':
                if (!smsData.phone) return '';
                return `smsto:${smsData.phone}:${smsData.message}`;
            case 'geo':
                if (!geoData.latitude || !geoData.longitude) return '';
                return `geo:${geoData.latitude},${geoData.longitude}`;
            case 'text':
            default:
                return textValue;
        }
    }, [qrType, textValue, wifiData, vCardData, emailData, smsData, geoData]);

    const handleStyleChange = (style) => {
        setQrStyle(style);
        if (style === 'rounded' || style === 'fluid') {
            setDownloadFormat('svg');
            showToast('SVG format recommended for this style');
        }
    };
    
    const handleCopyValue = useCallback(() => {
        if (!qrValue) return;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(qrValue)
                .then(() => showToast('Raw value copied!'))
                .catch(() => {
                    const success = fallbackCopyTextToClipboard(qrValue);
                    if (success) showToast('Raw value copied!');
                    else showToast('Copy failed. Please copy manually.');
                });
        } else {
            const success = fallbackCopyTextToClipboard(qrValue);
            if (success) showToast('Raw value copied!');
            else showToast('Copy failed. Please copy manually.');
        }
    }, [qrValue, showToast]);

    const handleClearInputs = useCallback(() => {
        switch (qrType) {
            case 'wifi': setWifiData({ ssid: '', password: '', encryption: 'WPA' }); break;
            case 'vcard': setVCardData({ name: '', phone: '', email: '', org: '' }); break;
            case 'email': setEmailData({ email: '', subject: '', body: '' }); break;
            case 'sms': setSmsData({ phone: '', message: '' }); break;
            case 'geo': setGeoData({ latitude: '', longitude: '' }); break;
            case 'text': default: setTextValue(''); break;
        }
        showToast('Inputs cleared!');
    }, [qrType, showToast]);

    const validationErrors = useMemo(() => {
        const errors = {};
        if (qrType === 'wifi' && !wifiData.ssid) errors.ssid = 'Network Name is required.';
        if (qrType === 'vcard' && !vCardData.name) errors.name = 'Name is required.';
        if (qrType === 'vcard' && !vCardData.phone && !vCardData.email) errors.contact = 'At least a phone or email is required.';
        if (qrType === 'email' && !emailData.email) errors.email = 'Recipient email is required.';
        if (qrType === 'sms' && !smsData.phone) errors.phone = 'Phone Number is required.';
        if (qrType === 'geo' && !geoData.latitude) errors.latitude = 'Latitude is required.';
        if (qrType === 'geo' && !geoData.longitude) errors.longitude = 'Longitude is required.';
        return errors;
    }, [qrType, wifiData, vCardData, emailData, smsData, geoData]);
    
    const isFormValid = Object.keys(validationErrors).length === 0 && !!qrValue;

    const qrKey = useMemo(() => {
        return [qrValue, size, bgColor, level, qrStyle, eyeRadius, logoImage, logoDimensions.width, logoDimensions.height, enableGradient, gradientStart, gradientEnd, gradientDirection, fgColor].join('-');
    }, [qrValue, size, bgColor, level, qrStyle, eyeRadius, logoImage, logoDimensions, enableGradient, gradientStart, gradientEnd, gradientDirection, fgColor]);

    useEffect(() => {
        setIsQrVisible(false);
        const timer = setTimeout(() => setIsQrVisible(true), 100);
        return () => clearTimeout(timer);
    }, [qrKey]);

    useEffect(() => {
        if (qrStyle === 'fluid' && isQrVisible) {
            const svgFilterTimer = setTimeout(() => {
                const svg = document.getElementById('qr-code-svg');
                if (!svg) return;
                if (svg.querySelector('#fluid-filter')) return;
                const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
                const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
                filter.setAttribute('id', 'fluid-filter');
                const blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
                blur.setAttribute('in', 'SourceGraphic'); blur.setAttribute('stdDeviation', '7'); blur.setAttribute('result', 'blur');
                const colorMatrix = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
                colorMatrix.setAttribute('in', 'blur'); colorMatrix.setAttribute('mode', 'matrix'); colorMatrix.setAttribute('values', '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7'); colorMatrix.setAttribute('result', 'contrast');
                filter.appendChild(blur); filter.appendChild(colorMatrix); defs.appendChild(filter);
                svg.prepend(defs);
                const qrGroup = svg.querySelector('g');
                if(qrGroup) qrGroup.setAttribute('filter', 'url(#fluid-filter)');
            }, 50);
            return () => clearTimeout(svgFilterTimer);
        }
    }, [qrKey, qrStyle, isQrVisible]);

    useEffect(() => {
        if (enableGradient && isQrVisible) {
            const timer = setTimeout(() => {
                const canvas = document.getElementById('qr-code-canvas');
                if (!canvas) return;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;
                let grad; const { width, height } = canvas;
                switch (gradientDirection) {
                    case 'horizontal': grad = ctx.createLinearGradient(0, 0, width, 0); break;
                    case 'diagonal': grad = ctx.createLinearGradient(0, 0, width, height); break;
                    default: grad = ctx.createLinearGradient(0, 0, 0, height); break;
                }
                grad.addColorStop(0, gradientStart); grad.addColorStop(1, gradientEnd);
                ctx.globalCompositeOperation = 'source-in'; ctx.fillStyle = grad;
                ctx.fillRect(0, 0, width, height); ctx.globalCompositeOperation = 'source-over';
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [qrKey, enableGradient, gradientStart, gradientEnd, gradientDirection, isQrVisible]);

    const getCurrentStyleSettings = () => ({
        size, fgColor, bgColor, level, qrStyle, eyeRadius,
        enableGradient, gradientStart, gradientEnd, gradientDirection
    });

    const applyStyleTemplate = useCallback((template) => {
        setSize(template.size); setFgColor(template.fgColor); setBgColor(template.bgColor);
        setLevel(template.level); setQrStyle(template.qrStyle); setEyeRadius(template.eyeRadius);
        setEnableGradient(template.enableGradient); setGradientStart(template.gradientStart);
        setGradientEnd(template.gradientEnd); setGradientDirection(template.gradientDirection);
        showToast(`Template "${template.name}" applied!`);
    }, [showToast]);

    const saveStyleTemplate = () => {
        const name = prompt("Enter a name for this style template:", "My Custom Style");
        if (name) {
            const newTemplate = { id: Date.now(), name, ...getCurrentStyleSettings() };
            const updatedTemplates = [...templates, newTemplate];
            setTemplates(updatedTemplates);
            localStorage.setItem('qrStyleTemplates', JSON.stringify(updatedTemplates));
            showToast(`Template "${name}" saved!`);
        }
    };

    const deleteStyleTemplate = (id) => {
        const updatedTemplates = templates.filter(t => t.id !== id);
        setTemplates(updatedTemplates);
        localStorage.setItem('qrStyleTemplates', JSON.stringify(updatedTemplates));
        showToast("Template deleted.");
    };

    const handleResetStyles = useCallback(() => {
        setSize(DEFAULTS.size); setFgColor(DEFAULTS.fgColor); setBgColor(DEFAULTS.bgColor);
        setLevel(DEFAULTS.level); setQrStyle(DEFAULTS.qrStyle); setEyeRadius(DEFAULTS.eyeRadius);
        setEnableGradient(DEFAULTS.enableGradient); setGradientStart(DEFAULTS.gradientStart);
        setGradientEnd(DEFAULTS.gradientEnd); setGradientDirection(DEFAULTS.gradientDirection);
        setLogoImage(null);
        showToast('Styles have been reset!');
    }, [showToast]);

    const handleDownload = useCallback(() => {
        if (downloadFormat === 'png') {
            const canvas = document.getElementById('qr-code-canvas');
            if (canvas) {
                const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
                const downloadLink = document.createElement('a');
                downloadLink.href = pngUrl; downloadLink.download = 'qrcode.png';
                document.body.appendChild(downloadLink); downloadLink.click(); document.body.removeChild(downloadLink);
            }
        } else if (downloadFormat === 'svg') {
            const svg = document.getElementById('qr-code-svg');
            if (svg) {
                const svgData = new XMLSerializer().serializeToString(svg);
                const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                const svgUrl = URL.createObjectURL(svgBlob);
                const downloadLink = document.createElement('a');
                downloadLink.href = svgUrl; downloadLink.download = 'qrcode.svg';
                document.body.appendChild(downloadLink); downloadLink.click();
                document.body.removeChild(downloadLink); URL.revokeObjectURL(svgUrl);
            }
        }
        showToast(`Downloading ${downloadFormat.toUpperCase()}...`);
    }, [downloadFormat, showToast]);

    const handleLogoUpload = useCallback((event) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => { setLogoImage(reader.result); };
            reader.readAsDataURL(file);
        } else {
            setLogoImage(null);
        }
    }, []);

    const removeLogo = useCallback(() => {
        setLogoImage(null);
        const fileInput = document.getElementById('logo-input');
        if (fileInput) fileInput.value = '';
    }, []);

    const parseEyeRadiusFromString = (valueStr) => {
        const str = String(valueStr).trim();
        if (str.includes(',')) return str.split(',').map(r => parseInt(r.trim(), 10) || 0);
        const singleVal = parseInt(str, 10);
        return Array(4).fill(isNaN(singleVal) ? 0 : singleVal);
    };

    const isLogoDisabled = qrStyle === 'fluid';
    const imageSettings = (logoImage && !isLogoDisabled) ? { src: logoImage, height: logoDimensions.height, width: logoDimensions.width, excavate: true } : undefined;
    const parsedEyeRadius = parseEyeRadiusFromString(eyeRadius);
    const currentQrFgColor = enableGradient ? '#FFFFFF' : fgColor;
    const wrapperClassName = `qr-code-styler-wrapper qr-style-${qrStyle}`;
    
    return (
        <div className="simple-container">
            <h1>QR Generator</h1>
            <DataTypeTabs activeType={qrType} setActiveType={setQrType} />
            <div className={`${wrapperClassName} qr-preview-wrapper`}>
                <div className={`qr-code-container ${isQrVisible ? 'visible' : ''}`}>
                    {qrValue ? (
                        <>
                            <QRCodeCanvas key={qrKey} id="qr-code-canvas" value={qrValue} size={size} fgColor={currentQrFgColor} bgColor={bgColor} level={level} imageSettings={imageSettings} qrStyle={qrStyle} eyeRadius={parsedEyeRadius} style={{ display: downloadFormat === 'png' ? 'block' : 'none' }} />
                            <QRCodeSVG key={`${qrKey}-svg`} id="qr-code-svg" value={qrValue} size={size} fgColor={fgColor} bgColor={bgColor} level={level} imageSettings={imageSettings} style={{ display: downloadFormat === 'svg' ? 'block' : 'none' }} />
                        </>
                    ) : (
                        <p style={{ color: '#888', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FiLink /> Enter data to generate a QR code
                        </p>
                    )}
                </div>
            </div>
            {qrType === 'text' && <TextInput value={textValue} setValue={setTextValue} />}
            {qrType === 'wifi' && <WifiInput data={wifiData} setData={setWifiData} errors={validationErrors} />}
            {qrType === 'vcard' && <VCardInput data={vCardData} setData={setVCardData} errors={validationErrors} />}
            {qrType === 'email' && <EmailInput data={emailData} setData={setEmailData} errors={validationErrors} />}
            {qrType === 'sms' && <SmsInput data={smsData} setData={setSmsData} errors={validationErrors} />}
            {qrType === 'geo' && <GeoInput data={geoData} setData={setGeoData} errors={validationErrors} />}
            
            {qrType !== 'text' && qrValue && (
                <DataOverview value={qrValue} />
            )}

            <div className="helper-actions">
                <button onClick={handleCopyValue} className="secondary-btn" style={{flex: 1}} title="Copy raw QR value"><FiCopy /> <span>Copy</span></button>
                <button onClick={handleClearInputs} className="secondary-btn" style={{flex: 1}} title="Clear all inputs"><FiTrash2 /> <span>Clear</span></button>
            </div>
            <div className="download-format-selector">
                <label>
                    <input type="radio" name="format" value="png" checked={downloadFormat === 'png'} onChange={(e) => setDownloadFormat(e.target.value)} />
                    <span>PNG</span>
                </label>
                <label>
                    <input type="radio" name="format" value="svg" checked={downloadFormat === 'svg'} onChange={(e) => setDownloadFormat(e.target.value)} />
                    <span>SVG</span>
                </label>
            </div>
            <button onClick={handleDownload} className="primary-btn" disabled={!isFormValid}>
                <FiDownload /> {isFormValid ? 'Download QR Code' : 'Complete Required Fields'}
            </button>
            <hr className="options-divider" />
            <button onClick={() => setShowOptions(!showOptions)} className="secondary-btn">
                {showOptions ? <><FiX /> Hide Options</> : <><FiSettings /> Customize</>}
            </button>
            <div className={`options-container ${showOptions ? 'show' : ''}`}>
                <div className="custom-options">
                    <div className="template-manager">
                        <label style={{fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}><FiFolder /> Style Templates</label>
                        {templates.length > 0 ? (
                            <div className="template-list">
                                {templates.map(t => (
                                    <div key={t.id} className="template-item">
                                        <span onClick={() => applyStyleTemplate(t)} title={`Apply "${t.name}"`}>{t.name}</span>
                                        <button onClick={() => deleteStyleTemplate(t.id)} title="Delete template"><FiTrash2 size={16}/></button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <small style={{textAlign: 'center', color: 'var(--text-secondary)'}}>No saved templates.</small>
                        )}
                        <button onClick={saveStyleTemplate} className="secondary-btn">
                            <FiSave /> Save Current Style
                        </button>
                    </div>
                    <button onClick={handleResetStyles} className="secondary-btn" style={{borderColor: 'var(--accent-color)'}}>
                        <FiRefreshCw /> Reset All Styles
                    </button>
                    <div className="option-group">
                        <label><FiZap /> Size (px)</label>
                        <input type="number" value={size} onChange={(e) => setSize(parseInt(e.target.value, 10))} />
                    </div>
                    <div className="option-group">
                        <label><FiDroplet /> Style</label>
                        <select value={qrStyle} onChange={(e) => handleStyleChange(e.target.value)}>
                            <option value="squares">Squares</option>
                            <option value="dots">Dots</option>
                            <option value="rounded">Rounded (SVG Only)</option>
                            <option value="fluid">Fluid (SVG Only)</option>
                        </select>
                        {(qrStyle === 'rounded' || qrStyle === 'fluid') && (<small className="style-note">SVG format is recommended for this style.</small>)}
                    </div>
                    <div className="option-group">
                        <label><FiEye /> Eye Radius</label>
                        <input type="text" value={eyeRadius} onChange={(e) => setEyeRadius(e.target.value)} placeholder="e.g. 10 or 10,0,10,0" />
                    </div>
                    <div className="color-picker-group">
                        <div className="option-group">
                            <label style={{ color: enableGradient ? '#aaa' : 'inherit' }}>Foreground</label>
                            <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} disabled={enableGradient} />
                        </div>
                        <div className="option-group">
                            <label>Background</label>
                            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
                        </div>
                    </div>
                    <div className="option-group gradient-fieldset">
                        <label className="checkbox-label" style={{ fontWeight: 'bold' }}>
                            <input type="checkbox" checked={enableGradient} onChange={(e) => setEnableGradient(e.target.checked)} />
                            <span>Enable Gradient</span>
                        </label>
                        {enableGradient && (
                            <div className="color-picker-group">
                                <div className="option-group"><label>Start</label><input type="color" value={gradientStart} onChange={(e) => setGradientStart(e.target.value)} /></div>
                                <div className="option-group"><label>End</label><input type="color" value={gradientEnd} onChange={(e) => setGradientEnd(e.target.value)} /></div>
                                <div className="option-group" style={{gridColumn: '1 / -1'}}><label>Direction</label><select value={gradientDirection} onChange={(e) => setGradientDirection(e.target.value)}><option value="vertical">Vertical</option><option value="horizontal">Horizontal</option><option value="diagonal">Diagonal</option></select></div>
                            </div>
                        )}
                    </div>
                    <div className="option-group">
                        <label><FiImage /> Logo</label>
                        {isLogoDisabled && <small className="style-note" style={{marginTop: 0}}>Logo is disabled for Fluid style.</small>}
                        <input id="logo-input" type="file" accept="image/*" onChange={handleLogoUpload} disabled={isLogoDisabled}/>
                        {logoImage && !isLogoDisabled && (
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px'}}>
                                <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                                    <input type="number" value={logoDimensions.width} onChange={(e) => setLogoDimensions(d => ({ ...d, width: parseInt(e.target.value) || 0 }))} style={{width: '70px'}} title="Logo Width" />
                                    <span>x</span>
                                    <input type="number" value={logoDimensions.height} onChange={(e) => setLogoDimensions(d => ({ ...d, height: parseInt(e.target.value) || 0 }))} style={{width: '70px'}} title="Logo Height" />
                                </div>
                                <button onClick={removeLogo} style={{ all: 'unset', color: 'var(--accent-color)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9em' }}><FiX /> Remove</button>
                            </div>
                        )}
                    </div>
                    <div className="option-group">
                        <label>Error Correction</label>
                        <select value={level} onChange={(e) => setLevel(e.target.value)}>
                            <option value="L">Low</option><option value="M">Medium</option><option value="Q">Quartile</option><option value="H">High</option>
                        </select>
                        <small style={{color: '#777', fontSize: '0.8em'}}>Use High (H) when adding a logo.</small>
                    </div>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} />
        </div>
    );
};

export default QRCodeGenerator;
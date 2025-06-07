import React, { useState, useRef, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const QRCodeGenerator = () => {
    // All state variables remain the same...
    const [text, setText] = useState('https://reactjs.org');
    const [size, setSize] = useState(256);
    const [fgColor, setFgColor] = useState('#000000');
    const [bgColor, setBgColor] = useState('#FFFFFF');
    const [level, setLevel] = useState('M');
    const [includeMargin, setIncludeMargin] = useState(true); // Margin on by default is nice

    const [logoImage, setLogoImage] = useState(null);
    const [logoWidth, setLogoWidth] = useState(60);
    const [logoHeight, setLogoHeight] = useState(60);
    const [removeQrCodeBehindLogo, setRemoveQrCodeBehindLogo] = useState(true);

    const [eyeRadius, setEyeRadius] = useState('0');
    const [qrStyle, setQrStyle] = useState('squares');

    const [enableGradientFg, setEnableGradientFg] = useState(false);
    const [gradientFgStart, setGradientFgStart] = useState('#4299E1');
    const [gradientFgEnd, setGradientFgEnd] = useState('#2B6CB0');
    const [gradientFgDirection, setGradientFgDirection] = useState('vertical');

    // All logic and functions remain the same...
    const qrCanvasComponentRef = useRef(null);

    const applyGradientToCanvas = () => {
        if (!enableGradientFg) return;
        const canvasElement = document.getElementById('qr-code-canvas');
        if (!canvasElement) return;
        const ctx = canvasElement.getContext('2d');
        if (!ctx) return;
        let grad;
        const canvasWidth = canvasElement.width;
        const canvasHeight = canvasElement.height;
        switch (gradientFgDirection) {
            case 'horizontal': grad = ctx.createLinearGradient(0, 0, canvasWidth, 0); break;
            case 'diagonal-tl-br': grad = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight); break;
            case 'diagonal-tr-bl': grad = ctx.createLinearGradient(canvasWidth, 0, 0, canvasHeight); break;
            default: grad = ctx.createLinearGradient(0, 0, 0, canvasHeight); break;
        }
        grad.addColorStop(0, gradientFgStart);
        grad.addColorStop(1, gradientFgEnd);
        ctx.globalCompositeOperation = 'source-in';
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.globalCompositeOperation = 'source-over';
    };

    useEffect(() => {
        const timer = setTimeout(() => { applyGradientToCanvas(); }, 50);
        return () => clearTimeout(timer);
    }, [ text, size, bgColor, level, includeMargin, logoImage, logoWidth, logoHeight, removeQrCodeBehindLogo, eyeRadius, qrStyle, fgColor, enableGradientFg, gradientFgStart, gradientFgEnd, gradientFgDirection ]);

    const handleLogoUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => { setLogoImage(reader.result); };
            reader.readAsDataURL(file);
        } else {
            setLogoImage(null);
        }
    };

    const handleDownload = () => {
        if (enableGradientFg) { applyGradientToCanvas(); }
        const canvas = document.getElementById('qr-code-canvas');
        if (canvas) {
            const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
            let downloadLink = document.createElement('a');
            downloadLink.href = pngUrl;
            downloadLink.download = `qr-code-${text.substring(0,15).replace(/[^a-zA-Z0-9]/g, '_') || 'custom'}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    };

    const imageSettings = logoImage ? { src: logoImage, height: parseInt(logoHeight, 10), width: parseInt(logoWidth, 10), excavate: removeQrCodeBehindLogo } : undefined;
    const parseEyeRadiusFromString = (valueStr) => {
        if (typeof valueStr !== 'string') valueStr = String(valueStr);
        if (valueStr.includes(',')) {
            return valueStr.split(',').map(r => { const num = parseInt(r.trim(), 10); return isNaN(num) ? 0 : num; });
        }
        const singleVal = parseInt(valueStr.trim(), 10);
        const validSingleVal = isNaN(singleVal) ? 0 : singleVal;
        return [validSingleVal, validSingleVal, validSingleVal, validSingleVal];
    };
    const currentQrFgColor = enableGradientFg ? '#000001' : fgColor;
    
    // The return statement with the new structure
    return (
        <div className="app-layout">
            <div className="sidebar">
                <h2>QR Code Options</h2>

                <div className="control-group">
                    <label htmlFor="text">Data (URL, Text, etc.)</label>
                    <input type="text" id="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="https://example.com" />
                </div>

                <div className="control-group">
                    <label htmlFor="size">Size (px)</label>
                    <input type="number" id="size" value={size} min="50" max="1000" step="8" onChange={(e) => setSize(parseInt(e.target.value, 10))} />
                </div>

                <div className="control-group">
                    <label htmlFor="level">Error Correction</label>
                    <select id="level" value={level} onChange={(e) => setLevel(e.target.value)}>
                        <option value="L">Low (L)</option>
                        <option value="M">Medium (M)</option>
                        <option value="Q">Quartile (Q)</option>
                        <option value="H">High (H)</option>
                    </select>
                </div>
                
                <hr style={{margin: '32px 0'}}/>

                <h3>Style & Colors</h3>

                <div className="control-group">
                    <label className={enableGradientFg ? 'label-disabled' : ''}>Solid Foreground</label>
                    <input type="color" id="fgColor" value={fgColor} onChange={(e) => setFgColor(e.target.value)} disabled={enableGradientFg} />
                </div>
                <div className="control-group">
                    <label>Background</label>
                    <input type="color" id="bgColor" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
                </div>

                <fieldset className="gradient-controls-fieldset">
                    <legend>Gradient</legend>
                    <label className="checkbox-label">
                        <input type="checkbox" id="enableGradientFg" checked={enableGradientFg} onChange={(e) => setEnableGradientFg(e.target.checked)} />
                        <span>Enable Gradient Foreground</span>
                    </label>

                    {enableGradientFg && (
                        <div style={{marginTop: '16px'}}>
                            <div className="control-group">
                                <label>Start Color</label>
                                <input type="color" id="gradientFgStart" value={gradientFgStart} onChange={(e) => setGradientFgStart(e.target.value)} />
                            </div>
                            <div className="control-group">
                                <label>End Color</label>
                                <input type="color" id="gradientFgEnd" value={gradientFgEnd} onChange={(e) => setGradientFgEnd(e.target.value)} />
                            </div>
                            <div className="control-group">
                                <label>Direction</label>
                                <select id="gradientFgDirection" value={gradientFgDirection} onChange={(e) => setGradientFgDirection(e.target.value)}>
                                    <option value="vertical">Vertical</option>
                                    <option value="horizontal">Horizontal</option>
                                    <option value="diagonal-tl-br">Diagonal</option>
                                </select>
                            </div>
                        </div>
                    )}
                </fieldset>

                <div className="control-group">
                    <label htmlFor="qrStyle">Module Style</label>
                    <select id="qrStyle" value={qrStyle} onChange={(e) => setQrStyle(e.target.value)}>
                        <option value="squares">Squares</option>
                        <option value="dots">Dots</option>
                    </select>
                </div>

                <div className="control-group">
                    <label htmlFor="eyeRadiusInput">Eye Radius</label>
                    <input type="text" id="eyeRadiusInput" value={eyeRadius} onChange={(e) => setEyeRadius(e.target.value)} placeholder="e.g., 10 or 10,0,10,0" />
                </div>

                 <label className="checkbox-label">
                    <input type="checkbox" id="includeMargin" checked={includeMargin} onChange={(e) => setIncludeMargin(e.target.checked)} />
                    <span>Include Margin (Quiet Zone)</span>
                </label>

                <hr style={{margin: '32px 0'}}/>

                <h3>Logo</h3>
                <div className="control-group">
                    <input type="file" id="logo" accept="image/png, image/jpeg, image/svg+xml" onChange={handleLogoUpload} />
                    {logoImage && <button onClick={() => { setLogoImage(null); document.getElementById('logo').value = null; }} className="remove-logo-btn">Remove</button>}
                </div>
                {logoImage && (
                    <>
                        <div className="control-group">
                            <label>Logo Width (px)</label>
                            <input type="number" value={logoWidth} onChange={(e) => setLogoWidth(parseInt(e.target.value, 10))} />
                        </div>
                        <div className="control-group">
                            <label>Logo Height (px)</label>
                            <input type="number" value={logoHeight} onChange={(e) => setLogoHeight(parseInt(e.target.value, 10))} />
                        </div>
                        <label className="checkbox-label">
                            <input type="checkbox" checked={removeQrCodeBehindLogo} onChange={(e) => setRemoveQrCodeBehindLogo(e.target.checked)} />
                            <span>Clear Space Behind Logo</span>
                        </label>
                    </>
                )}
            </div>
            
            <main className="main-content">
                <div className="qr-preview-card">
                    <h3>QR Code Preview</h3>
                    {text ? (
                        <QRCodeCanvas
                            id="qr-code-canvas"
                            value={text}
                            size={Math.min(size, 400)} // Cap preview size for aesthetics
                            fgColor={currentQrFgColor}
                            bgColor={bgColor}
                            level={level}
                            includeMargin={includeMargin}
                            imageSettings={imageSettings}
                            eyeRadius={parseEyeRadiusFromString(eyeRadius)}
                            qrStyle={qrStyle}
                            ref={qrCanvasComponentRef} 
                        />
                    ) : (
                        <p>Enter data to generate a QR code.</p>
                    )}
                    <p className="notes">
                        High error correction (H) is recommended when using a logo.
                    </p>
                    <button onClick={handleDownload} className="download-btn" style={{marginTop: '24px'}}>
                        Download QR Code
                    </button>
                </div>
            </main>
        </div>
    );
};

export default QRCodeGenerator;

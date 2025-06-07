import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
// Import icons from react-icons
import { FiDownload, FiSettings, FiX, FiImage, FiDroplet, FiEye, FiZap, FiLink } from 'react-icons/fi';

const QRCodeGenerator = () => {
    // --- STATE ---
    const [showOptions, setShowOptions] = useState(false);
    const [text, setText] = useState('https://reactjs.org');
    const [size, setSize] = useState(256);
    const [fgColor, setFgColor] = useState('#000000');
    const [bgColor, setBgColor] = useState('#FFFFFF');
    const [level, setLevel] = useState('M');
    const [logoImage, setLogoImage] = useState(null);
    const [logoWidth, setLogoWidth] = useState(40);
    const [logoHeight, setLogoHeight] = useState(40);
    const [qrStyle, setQrStyle] = useState('squares');
    const [eyeRadius, setEyeRadius] = useState('0'); // Re-added

    // Re-added gradient state
    const [enableGradient, setEnableGradient] = useState(false);
    const [gradientStart, setGradientStart] = useState('#4facfe');
    const [gradientEnd, setGradientEnd] = useState('#00f2fe');
    const [gradientDirection, setGradientDirection] = useState('vertical');
    
    // --- LOGIC ---
    const applyGradientToCanvas = () => {
        if (!enableGradient) return;
        const canvasElement = document.getElementById('qr-code-canvas');
        if (!canvasElement) return;
        const ctx = canvasElement.getContext('2d');
        if (!ctx) return;
        let grad;
        const canvasWidth = canvasElement.width;
        const canvasHeight = canvasElement.height;
        switch (gradientDirection) {
            case 'horizontal': grad = ctx.createLinearGradient(0, 0, canvasWidth, 0); break;
            case 'diagonal': grad = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight); break;
            default: grad = ctx.createLinearGradient(0, 0, 0, canvasHeight); break;
        }
        grad.addColorStop(0, gradientStart);
        grad.addColorStop(1, gradientEnd);
        ctx.globalCompositeOperation = 'source-in';
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.globalCompositeOperation = 'source-over';
    };
    
    // Using a callback ref to apply gradient after canvas draws
    const qrCanvasRef = (canvas) => {
        if (canvas) {
            // This callback runs when the canvas is rendered or updated
            applyGradientToCanvas();
        }
    };

    const handleDownload = () => {
        const canvas = document.getElementById('qr-code-canvas');
        if (canvas) {
            if (enableGradient) applyGradientToCanvas(); // Ensure gradient is applied on download
            const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
            let downloadLink = document.createElement('a');
            downloadLink.href = pngUrl;
            downloadLink.download = 'qrcode.png';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    };

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

    const parseEyeRadiusFromString = (valueStr) => {
        if (typeof valueStr !== 'string') valueStr = String(valueStr);
        if (valueStr.includes(',')) {
            return valueStr.split(',').map(r => { const num = parseInt(r.trim(), 10); return isNaN(num) ? 0 : num; });
        }
        const singleVal = parseInt(valueStr.trim(), 10);
        const validSingleVal = isNaN(singleVal) ? 0 : singleVal;
        return [validSingleVal, validSingleVal, validSingleVal, validSingleVal];
    };
    
    const imageSettings = logoImage ? { src: logoImage, height: logoHeight, width: logoWidth, excavate: true } : undefined;
    const currentQrFgColor = enableGradient ? '#000001' : fgColor;
    
    return (
        <div className="simple-container">
            <h1>QR Code Generator</h1>

            <div className="qr-preview-wrapper">
                {text ? (
                    <QRCodeCanvas
                        id="qr-code-canvas"
                        value={text}
                        size={size}
                        fgColor={currentQrFgColor}
                        bgColor={bgColor}
                        level={level}
                        imageSettings={imageSettings}
                        qrStyle={qrStyle}
                        eyeRadius={parseEyeRadiusFromString(eyeRadius)}
                        ref={qrCanvasRef} // Use the callback ref
                    />
                ) : (
                    <p style={{ color: '#888', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiLink /> Enter text to see QR code
                    </p>
                )}
            </div>

            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="main-input"
                placeholder="Enter URL or text here"
            />

            <button onClick={handleDownload} className="primary-btn">
                <FiDownload /> Download QR Code
            </button>

            <hr className="options-divider" />
            
            <button onClick={() => setShowOptions(!showOptions)} className="secondary-btn">
                {showOptions ? <><FiX /> Hide Customization</> : <><FiSettings /> Show Customization</>}
            </button>

            {showOptions && (
                <div className="custom-options">
                    {/* --- Basic Options --- */}
                    <div className="option-group">
                        <label><FiZap /> Size (px)</label>
                        <input type="number" value={size} onChange={(e) => setSize(parseInt(e.target.value, 10))} />
                    </div>
                    <div className="option-group">
                        <label><FiDroplet /> Style</label>
                        <select value={qrStyle} onChange={(e) => setQrStyle(e.target.value)}>
                            <option value="squares">Squares</option>
                            <option value="dots">Dots</option>
                        </select>
                    </div>
                    <div className="option-group">
                        <label><FiEye /> Eye Radius</label>
                        <input type="text" value={eyeRadius} onChange={(e) => setEyeRadius(e.target.value)} placeholder="e.g. 10 or 10,0,10,0" />
                    </div>

                    {/* --- Colors --- */}
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
                    
                    {/* --- Gradient Feature --- */}
                    <div className="option-group gradient-fieldset">
                        <label className="checkbox-label" style={{ fontWeight: 'bold' }}>
                            <input type="checkbox" checked={enableGradient} onChange={(e) => setEnableGradient(e.target.checked)} />
                            <span>Enable Gradient</span>
                        </label>
                        {enableGradient && (
                            <div className="color-picker-group">
                                <div className="option-group">
                                    <label>Start</label>
                                    <input type="color" value={gradientStart} onChange={(e) => setGradientStart(e.target.value)} />
                                </div>
                                <div className="option-group">
                                    <label>End</label>
                                    <input type="color" value={gradientEnd} onChange={(e) => setGradientEnd(e.target.value)} />
                                </div>
                                <div className="option-group" style={{gridColumn: '1 / -1'}}>
                                    <label>Direction</label>
                                    <select value={gradientDirection} onChange={(e) => setGradientDirection(e.target.value)}>
                                        <option value="vertical">Vertical</option>
                                        <option value="horizontal">Horizontal</option>
                                        <option value="diagonal">Diagonal</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* --- Logo & Error Correction --- */}
                    <div className="option-group">
                        <label><FiImage /> Logo</label>
                        <input type="file" accept="image/*" onChange={handleLogoUpload} />
                        {logoImage && (
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px'}}>
                                <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                                    <input type="number" value={logoWidth} onChange={(e) => setLogoWidth(parseInt(e.target.value))} style={{width: '70px'}} title="Logo Width" />
                                    <span>x</span>
                                    <input type="number" value={logoHeight} onChange={(e) => setLogoHeight(parseInt(e.target.value))} style={{width: '70px'}} title="Logo Height" />
                                </div>
                                <button onClick={() => setLogoImage(null)} style={{ all: 'unset', color: 'var(--accent-color)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9em' }}>
                                    <FiX /> Remove
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="option-group">
                        <label>Error Correction</label>
                        <select value={level} onChange={(e) => setLevel(e.target.value)}>
                            <option value="L">Low</option>
                            <option value="M">Medium</option>
                            <option value="Q">Quartile</option>
                            <option value="H">High</option>
                        </select>
                        <small style={{color: '#777', fontSize: '0.8em'}}>Use High (H) when adding a logo.</small>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QRCodeGenerator;

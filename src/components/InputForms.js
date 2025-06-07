import React from 'react';

export const TextInput = ({ value, setValue }) => (
    <div className="form-grid">
        <div>
            <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter URL or any text..."
                rows={3}
            />
        </div>
    </div>
);

export const WifiInput = ({ data, setData, errors = {} }) => (
    <div className="form-grid">
        <div>
            <input
                type="text"
                value={data.ssid}
                onChange={(e) => setData({ ...data, ssid: e.target.value })}
                placeholder="WiFi Network Name (SSID)"
            />
        </div>
        {errors.ssid && <p className="input-error-message">{errors.ssid}</p>}
        <div>
            <input
                type="password"
                value={data.password}
                onChange={(e) => setData({ ...data, password: e.target.value })}
                placeholder="Password"
            />
        </div>
        {errors.password && <p className="input-error-message">{errors.password}</p>}
        <div>
            <select value={data.encryption} onChange={(e) => setData({...data, encryption: e.target.value})}>
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">No Password</option>
            </select>
        </div>
    </div>
);

export const VCardInput = ({ data, setData, errors = {} }) => (
    <div className="form-grid">
        {errors.contact && <p className="input-error-message">{errors.contact}</p>}
        <div>
            <input
                type="text"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                placeholder="Full Name"
            />
        </div>
        {errors.name && <p className="input-error-message">{errors.name}</p>}
        <div>
            <input
                type="tel"
                value={data.phone}
                onChange={(e) => setData({ ...data, phone: e.target.value })}
                placeholder="Phone Number"
            />
        </div>
        <div>
            <input
                type="email"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                placeholder="Email Address"
            />
        </div>
        <div>
            <input
                type="text"
                value={data.org}
                onChange={(e) => setData({ ...data, org: e.target.value })}
                placeholder="Organization"
            />
        </div>
    </div>
);

export const EmailInput = ({ data, setData, errors = {} }) => (
     <div className="form-grid">
        <div>
            <input
                type="email"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                placeholder="Recipient's Email"
            />
        </div>
        {errors.email && <p className="input-error-message">{errors.email}</p>}
        <div>
            <input
                type="text"
                value={data.subject}
                onChange={(e) => setData({ ...data, subject: e.target.value })}
                placeholder="Subject"
            />
        </div>
        <div>
            <textarea
                value={data.body}
                onChange={(e) => setData({ ...data, body: e.target.value })}
                placeholder="Message Body"
                rows={2}
            />
        </div>
    </div>
);

export const SmsInput = ({ data, setData, errors = {} }) => (
    <div className="form-grid">
        <div>
            <input
                type="tel"
                value={data.phone}
                onChange={(e) => setData({ ...data, phone: e.target.value })}
                placeholder="Phone Number"
            />
        </div>
        {errors.phone && <p className="input-error-message">{errors.phone}</p>}
        <div>
            <textarea
                value={data.message}
                onChange={(e) => setData({ ...data, message: e.target.value })}
                placeholder="Message (optional)"
                rows={3}
            />
        </div>
    </div>
);

export const GeoInput = ({ data, setData, errors = {} }) => (
    <div className="form-grid">
        <div>
            <input
                type="text"
                value={data.latitude}
                onChange={(e) => setData({ ...data, latitude: e.target.value })}
                placeholder="Latitude (e.g., 40.7128)"
            />
        </div>
        {errors.latitude && <p className="input-error-message">{errors.latitude}</p>}
        <div>
            <input
                type="text"
                value={data.longitude}
                onChange={(e) => setData({ ...data, longitude: e.target.value })}
                placeholder="Longitude (e.g., -74.0060)"
            />
        </div>
        {errors.longitude && <p className="input-error-message">{errors.longitude}</p>}
    </div>
);
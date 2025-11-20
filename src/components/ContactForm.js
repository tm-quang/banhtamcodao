// src/components/ContactForm.js
'use client';

import { useState } from 'react';

export default function ContactForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Tạm thời chỉ hiển thị thông báo. Sau này bạn có thể kết nối API để gửi email tại đây.
        console.log('Form Data:', formData);
        alert('Cảm ơn bạn đã gửi tin nhắn. Chúng tôi sẽ sớm liên hệ lại với bạn!');
        // Reset form
        setFormData({ name: '', email: '', message: '' });
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold text-secondary mb-6 text-center">Gửi Tin Nhắn</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label htmlFor="name" className="sr-only">Họ và Tên</label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md py-3 px-4 text-secondary focus:ring-primary focus:border-primary"
                        placeholder="Họ và Tên"
                    />
                </div>
                <div>
                    <label htmlFor="email" className="sr-only">Email</label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md py-3 px-4 text-secondary focus:ring-primary focus:border-primary"
                        placeholder="Email"
                    />
                </div>
                <div>
                    <label htmlFor="message" className="sr-only">Nội dung tin nhắn</label>
                    <textarea
                        name="message"
                        id="message"
                        required
                        rows="5"
                        value={formData.message}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md py-3 px-4 text-secondary focus:ring-primary focus:border-primary"
                        placeholder="Nội dung tin nhắn..."
                    ></textarea>
                </div>
                <button
                    type="submit"
                    className="w-full bg-primary text-white font-bold py-3 px-6 rounded-md hover:bg-orange-600 transition-colors shadow-lg text-lg"
                >
                    Gửi tin nhắn
                </button>
            </form>
        </div>
    );
}
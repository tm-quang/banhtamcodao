// src/components/ContactForm.js
'use client';

import { useState } from 'react';
import { Send, User, Mail, MessageSquare } from 'lucide-react';

export default function ContactForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Giả lập gửi form
        await new Promise(resolve => setTimeout(resolve, 1500));

        console.log('Form Data:', formData);
        alert('Cảm ơn bạn đã gửi tin nhắn. Chúng tôi sẽ sớm liên hệ lại với bạn!');

        // Reset form
        setFormData({ name: '', email: '', message: '' });
        setIsSubmitting(false);
    };

    return (
        <div className="bg-white/95 backdrop-blur-md p-5 md:p-7 rounded-2xl shadow-md w-full border border-gray-300">
            <div className="mb-6">
                <h2 className="text-3xl md:text-2xl font-lobster text-secondary mb-1">Gửi tin nhắn</h2>
                <div className="w-20 h-0.5 bg-primary rounded-full"></div>
                <p className="text-gray-500 mt-3 text-xs md:text-sm">
                    Chúng tôi sẽ phản hồi bạn sớm nhất có thể.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <User size={16} />
                    </div>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-10 pr-3 text-sm text-secondary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        placeholder="Họ và tên"
                    />
                </div>

                <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <Mail size={16} />
                    </div>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-10 pr-3 text-sm text-secondary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        placeholder="Email"
                    />
                </div>

                <div className="relative">
                    <div className="absolute left-3.5 top-4 text-gray-400">
                        <MessageSquare size={16} />
                    </div>
                    <textarea
                        name="message"
                        id="message"
                        required
                        rows="3"
                        value={formData.message}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-10 pr-3 text-sm text-secondary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                        placeholder="Nội dung tin nhắn..."
                    ></textarea>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full group relative overflow-hidden bg-primary text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 text-sm"
                >
                    {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <span>Gửi tin nhắn</span>
                            <Send size={14} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
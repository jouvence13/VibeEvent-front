import React from 'react';

const Footer = () => {
    return (
        <footer className="px-8 lg:px-12 py-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-8 bg-slate-50 text-slate-900 font-['Inter']">
            <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-red-600 to-red-500"></div>
                <h2 className="text-slate-900 font-black text-sm tracking-tighter">EventChill</h2>
            </div>
            <div className="flex gap-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <a href="#" className="hover:text-slate-900 transition-colors">Conditions d'Utilisation</a>
                <a href="#" className="hover:text-slate-900 transition-colors">Confidentialité</a>
                <a href="#" className="hover:text-slate-900 transition-colors">Centre d'aide</a>
            </div>
            <p className="text-[10px] text-slate-700 font-bold uppercase tracking-widest">© 2024 EventChill. TOUS DROITS RÉSERVÉS.</p>
        </footer>
    );
};

export default Footer;

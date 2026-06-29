"use client";

import { motion } from "motion/react";
import { Award, PackageCheck } from "lucide-react";
import Image from "next/image";

const topLibrarians = [
  { id: 1, name: "Rafiqul Islam", deliveries: 342, avatar: "https://i.ibb.co/68vD18M/avatar1.jpg" },
  { id: 2, name: "Sadia Rahman", deliveries: 289, avatar: "https://i.ibb.co/RzG324f/avatar2.jpg" },
  { id: 3, name: "Tanvir Ahmed", deliveries: 256, avatar: "https://i.ibb.co/3sX8b9p/avatar3.jpg" },
];

export default function TopLibrarians() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Top Librarians</h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            Meet our most active book providers who are making reading accessible for everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {topLibrarians.map((librarian, index) => (
            <motion.div
              key={librarian.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow relative"
            >
              <div className="absolute -top-4 bg-[#008854] text-white p-2 rounded-full shadow-lg">
                <Award size={24} />
              </div>
              
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#edf5e1] mb-4 mt-4">
                <Image 
                  src={librarian.avatar} 
                  alt={librarian.name}
                  width={200}
                  height={200} 
                  className="w-full h-full object-cover bg-slate-200" 
                />
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 mb-1">{librarian.name}</h3>
              <p className="text-[#008854] font-medium text-sm mb-4">Verified Provider</p>
              
              <div className="bg-slate-50 w-full py-3 rounded-lg flex items-center justify-center gap-2 border border-slate-100 mt-auto">
                <PackageCheck size={18} className="text-slate-500" />
                <span className="text-slate-700 font-semibold">{librarian.deliveries}</span>
                <span className="text-slate-500 text-sm">Completed Deliveries</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
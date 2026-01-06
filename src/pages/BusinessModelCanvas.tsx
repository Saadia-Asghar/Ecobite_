import React from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    Target,
    Share2,
    HeartHandshake,
    Wallet,
    Database,
    Activity,
    Handshake,
    CreditCard,
    ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BMCSection = ({ title, icon: Icon, items, color, className = "" }: { title: string, icon: any, items: string[], color: string, className?: string }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 ${className}`}
    >
        <div className={`flex items-center gap-2 mb-4 ${color}`}>
            <Icon size={20} />
            <h3 className="font-bold text-gray-800 uppercase tracking-wider text-sm">{title}</h3>
        </div>
        <ul className="space-y-2">
            {items.map((item, idx) => (
                <li key={idx} className="text-gray-600 text-sm leading-relaxed flex items-start gap-2">
                    <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-current opacity-60 ${color.replace('text-', 'bg-')}`} />
                    {item}
                </li>
            ))}
        </ul>
    </motion.div>
);

const BusinessModelCanvas = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6 md:p-12 font-sans">
            <div className="max-w-[1400px] mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="p-2 hover:bg-white/50 rounded-full transition-colors text-gray-600"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Business Model Canvas</h1>
                            <p className="text-gray-500">EcoBite — Idea Stage</p>
                        </div>
                    </div>
                    <div className="bg-emerald-100 text-emerald-800 px-4 py-1.5 rounded-full text-sm font-medium">
                        Version 1.0
                    </div>
                </div>

                {/* Canvas Layout */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:grid-rows-[auto_auto_auto]">

                    {/* Top Row - Main Blocks */}

                    {/* 8. Key Partnerships - Left Column Tall */}
                    <div className="md:col-span-1 md:row-span-2">
                        <BMCSection
                            title="Key Partnerships"
                            icon={Handshake}
                            className="h-full"
                            color="text-blue-600"
                            items={[
                                "NGOs and welfare organizations",
                                "Restaurants and institutions",
                                "Animal shelters",
                                "Sustainability partners"
                            ]}
                        />
                    </div>

                    {/* 7. Key Activities - Top Mid-Left */}
                    <div className="md:col-span-1">
                        <BMCSection
                            title="Key Activities"
                            icon={Activity}
                            color="text-indigo-600"
                            items={[
                                "Matching surplus with NGOs",
                                "Verification and coordination",
                                "Platform development"
                            ]}
                        />
                    </div>

                    {/* 2. Value Propositions - Center Column Tall */}
                    <div className="md:col-span-1 md:row-span-2">
                        <BMCSection
                            title="Value Propositions"
                            icon={Target}
                            className="h-full border-emerald-200 bg-emerald-50/50"
                            color="text-emerald-600"
                            items={[
                                "Reduces surplus waste through structured redistribution",
                                "Fast, transparent matching between donors and NGOs",
                                "Prioritized routing: people → animals → sustainability",
                                "Zero-cost, impact-driven platform"
                            ]}
                        />
                    </div>

                    {/* 4. Customer Relationships - Top Mid-Right */}
                    <div className="md:col-span-1">
                        <BMCSection
                            title="Customer Relationships"
                            icon={HeartHandshake}
                            color="text-pink-600"
                            items={[
                                "Onboarding and verification",
                                "Support and coordination",
                                "Impact reporting and feedback"
                            ]}
                        />
                    </div>

                    {/* 1. Customer Segments - Right Column Tall */}
                    <div className="md:col-span-1 md:row-span-2">
                        <BMCSection
                            title="Customer Segments"
                            icon={Users}
                            className="h-full"
                            color="text-purple-600"
                            items={[
                                "Restaurants, cafés, event organizers",
                                "NGOs, food banks, community kitchens",
                                "Animal shelters",
                                "Sustainability partners"
                            ]}
                        />
                    </div>

                    {/* Middle Row Extensions */}

                    {/* 6. Key Resources - Bottom Mid-Left */}
                    <div className="md:col-span-1">
                        <BMCSection
                            title="Key Resources"
                            icon={Database}
                            color="text-cyan-600"
                            items={[
                                "Platform technology",
                                "Verified NGO network",
                                "Team and partnerships"
                            ]}
                        />
                    </div>

                    {/* 3. Channels - Bottom Mid-Right */}
                    <div className="md:col-span-1">
                        <BMCSection
                            title="Channels"
                            icon={Share2}
                            color="text-orange-600"
                            items={[
                                "Web platform",
                                "Direct outreach to NGOs and donors",
                                "University and community partnerships"
                            ]}
                        />
                    </div>

                    {/* Bottom Row - Financials */}

                    {/* 9. Cost Structure - Bottom Left Half */}
                    <div className="md:col-span-2 md:col-start-1">
                        <BMCSection
                            title="Cost Structure"
                            icon={CreditCard}
                            color="text-red-500"
                            items={[
                                "Platform development",
                                "Operations and coordination",
                                "Outreach and partnerships"
                            ]}
                        />
                    </div>

                    {/* 5. Revenue Streams - Bottom Right Half (taking up the remaining 3 columns space nicely if we split 2.5/2.5 or just use col-span) 
              Actually 5 columns total. 
              Costs = 2 cols. 
              Value Prop (Center) extends down? No, standard BMC has Cost & Revenue at bottom spanning full width roughly.
              Let's make Cost spanning 2.5 cols and Revenue 2.5 cols? Tailwind grid doesn't do half cols easily.
              Let's do Cost: span 3, Revenue: span 2. Or simplified: Cost col 1-3, Revenue col 3-5? 
              
              Let's try: Cost (span 3), Revenue (span 2). 
              Wait, the top grid is 5 columns.
              Block 8 (0)
              Block 7 (1) Block 6 (2) [Wait, 7 is above 6 in col 2]
              Block 2 (2) 
              Block 4 (3) Block 3 (4) [Wait, 4 above 3 in col 4]
              Block 1 (4)
              
              Let's use specific placement.
              Col 1: Key Partners
              Col 2: Key Activities / Key Resources
              Col 3: Value Prop
              Col 4: Customer Rel / Channels
              Col 5: Customer Segments
              
              Bottom Row:
              Cost Structure (Span 3? or 2?)
              Revenue Streams (Span 2? or 3?)
          */}
                    <div className="md:col-span-3"> {/* Cost Structure - let's make it span 2.5 conceptually but 3 here */}
                        {/* wait, if I put it here in the flow, I need to make sure grid auto-placement works or be explicit.
                 The previous items filled Row 1 and Row 2 completely (5 cols x 2 rows basically).
                 So next items will flow to Row 3 automatically.
             */}
                    </div>
                </div>

                {/* Render Cost and Revenue properly in the grid flow */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <BMCSection
                        title="Cost Structure"
                        icon={CreditCard}
                        color="text-red-500"
                        items={[
                            "Platform development",
                            "Operations and coordination",
                            "Outreach and partnerships"
                        ]}
                    />
                    <BMCSection
                        title="Revenue Streams"
                        icon={Wallet}
                        color="text-green-600"
                        items={[
                            "Platform partnerships",
                            "Institutional subscriptions (future)",
                            "CSR and impact collaborations"
                        ]}
                    />
                </div>

            </div>
        </div>
    );
};

export default BusinessModelCanvas;

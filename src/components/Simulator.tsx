import React, { useState } from 'react';
import { Calculator, ArrowRight, CheckCircle, TrendingDown, DollarSign, RefreshCw } from 'lucide-react';

interface SimulatorProps {
  onPreFillForm: (data: { creditAmount: string; monthlyInstallment: string; objective?: string }) => void;
}

export const Simulator: React.FC<SimulatorProps> = ({ onPreFillForm }) => {
  const [credit, setCredit] = useState<number>(300000);
  const [months, setMonths] = useState<number>(180); // 15 years standard real estate
  const [adminFeeRate, setAdminFeeRate] = useState<number>(16); // 16% total admin fee over full duration
  const [reserveFundRate, setReserveFundRate] = useState<number>(2); // 2% reserve fund

  // Calculations
  const totalAdminFee = credit * (adminFeeRate / 100);
  const totalReserveFund = credit * (reserveFundRate / 100);
  const totalConsortiumCost = credit + totalAdminFee + totalReserveFund;
  const estimatedMonthlyInstallment = Math.round(totalConsortiumCost / months);

  // Comparison with financing (approx 10.5% p.a. over 15 years = ~1.9x to 2.2x total amount)
  const estimatedFinancingCost = Math.round(credit * 2.15);
  const estimatedFinancingMonthly = Math.round(estimatedFinancingCost / months);
  const totalSavings = estimatedFinancingCost - totalConsortiumCost;

  const handleSimulateClick = () => {
    let creditLabel = 'De R$ 300 mil a R$ 500 mil';
    if (credit <= 100000) creditLabel = 'Até R$ 100 mil';
    else if (credit <= 300000) creditLabel = 'De R$ 100 mil a R$ 300 mil';
    else if (credit <= 500000) creditLabel = 'De R$ 300 mil a R$ 500 mil';
    else if (credit <= 1000000) creditLabel = 'De R$ 500 mil a R$ 1 milhão';
    else creditLabel = 'Acima de R$ 1 milhão';

    let installmentLabel = 'De R$ 1.000 a R$ 2.500';
    if (estimatedMonthlyInstallment <= 1000) installmentLabel = 'Até R$ 1.000';
    else if (estimatedMonthlyInstallment <= 2500) installmentLabel = 'De R$ 1.000 a R$ 2.500';
    else if (estimatedMonthlyInstallment <= 5000) installmentLabel = 'De R$ 2.500 a R$ 5.000';
    else if (estimatedMonthlyInstallment <= 10000) installmentLabel = 'De R$ 5.000 a R$ 10.000';
    else installmentLabel = 'Acima de R$ 10.000';

    onPreFillForm({
      creditAmount: creditLabel,
      monthlyInstallment: installmentLabel,
    });
  };

  return (
    <section id="simulador" className="py-20 bg-slate-900/60 text-slate-100 border-b border-slate-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            SIMULADOR INTERATIVO
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Simule o Valor do seu Crédito e Parcela
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Faça uma estimativa rápida e compare o custo do consórcio com o financiamento bancário tradicional.
          </p>
        </div>

        {/* Calculator Tool Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Controls Left */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Credit Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <label className="text-slate-300 font-medium">Valor de Crédito Desejado:</label>
                <span className="text-amber-400 font-extrabold text-xl font-mono">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(credit)}
                </span>
              </div>
              <input
                type="range"
                min={50000}
                max={2000000}
                step={25000}
                value={credit}
                onChange={(e) => setCredit(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>R$ 50 mil</span>
                <span>R$ 1 Milhão</span>
                <span>R$ 2 Milhões</span>
              </div>
            </div>

            {/* Months Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <label className="text-slate-300 font-medium">Prazo Total em Meses:</label>
                <span className="text-amber-400 font-extrabold text-lg font-mono">
                  {months} meses ({Math.round(months / 12)} anos)
                </span>
              </div>
              <input
                type="range"
                min={36}
                max={240}
                step={12}
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>36 m (3 anos)</span>
                <span>120 m (10 anos)</span>
                <span>240 m (20 anos)</span>
              </div>
            </div>

            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Taxa de Adm. Média Estimada:</span>
                <span className="text-slate-200 font-mono">{adminFeeRate}% total diluído</span>
              </div>
              <div className="flex justify-between">
                <span>Fundo de Reserva:</span>
                <span className="text-slate-200 font-mono">{reserveFundRate}% total</span>
              </div>
              <div className="text-[10px] text-slate-500 pt-1">
                *Valores aproximados para fins educativos. As condições exatas dependem das regras de cada grupo e administradora.
              </div>
            </div>

          </div>

          {/* Results Right */}
          <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-6">
            
            <div className="border-b border-slate-850 pb-4">
              <span className="text-xs text-slate-400 uppercase tracking-wider block">Estimativa de Parcela Mensal no Consórcio</span>
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-mono mt-1">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(estimatedMonthlyInstallment)}
                <span className="text-xs text-slate-400 font-normal"> / mês</span>
              </div>
            </div>

            {/* Comparison vs Financing */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Comparativo com Financiamento Tradicional:</span>
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Custo Financiamento Bancário:</span>
                  <span className="text-red-400 font-bold text-sm block mt-0.5">
                    ~{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(estimatedFinancingCost)}
                  </span>
                  <span className="text-[10px] text-slate-500">Parcela ~{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(estimatedFinancingMonthly)}/mês</span>
                </div>

                <div className="bg-slate-900 p-3 rounded-xl border border-amber-500/40">
                  <span className="text-slate-400 block text-[11px]">Custo Total Consórcio:</span>
                  <span className="text-emerald-400 font-bold text-sm block mt-0.5">
                    ~{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalConsortiumCost)}
                  </span>
                  <span className="text-[10px] text-amber-300 font-semibold">Sem juros compostos</span>
                </div>
              </div>

              {/* Total Savings Badge */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-emerald-400" />
                  <div>
                    <span className="text-xs font-bold text-emerald-300 block">Economia Estimada em Relação aos Juros:</span>
                    <span className="text-xs text-slate-300">Aproximadamente {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalSavings)}</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleSimulateClick}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-xs uppercase tracking-wider py-4 rounded-xl transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              <span>Usar esta Simulação no Meu Cadastro</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>

        </div>

      </div>
    </section>
  );
};

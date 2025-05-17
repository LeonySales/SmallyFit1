export function MotivationalCard() {
  // Array of motivational quotes
  const quotes = [
    "O sucesso na saúde exige consistência, não perfeição.",
    "Cuide do seu corpo. É o único lugar que você tem para viver.",
    "Sua saúde é um investimento, não uma despesa.",
    "Pequenos passos levam a grandes mudanças.",
    "Não se compare a outros, compare-se ao seu eu de ontem.",
    "Sua maior transformação começa onde termina sua zona de conforto."
  ];
  
  // Get a random quote
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  
  return (
    <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-5 text-white mb-6 shadow-md">
      <blockquote className="italic font-medium text-lg mb-2">
        "{randomQuote}"
      </blockquote>
      <p className="text-right text-primary-200 text-sm">- SmallyFit</p>
    </div>
  );
}

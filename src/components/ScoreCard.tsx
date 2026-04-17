interface Props {
  score: number;
  accuracy: number;
  total: number;
}

export default function ScoreCard({ score, accuracy, total }: Props) {
  const passed = accuracy >= 60;

  return (
    <div className={`bg-white rounded-xl shadow-md p-8 text-center border-t-4 ${passed ? "border-green-500" : "border-red-400"}`}>
      <div className="text-5xl font-bold mb-2">{accuracy}%</div>
      <p className="text-gray-600 text-lg">{score} / {total} correct</p>
      <span className={`inline-block mt-3 px-4 py-1 rounded-full text-sm font-semibold ${
        passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
      }`}>
        {passed ? "Passed 🎉" : "Keep Practicing 💪"}
      </span>
    </div>
  );
}

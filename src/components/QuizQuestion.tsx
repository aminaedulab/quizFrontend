interface Props {
  index: number;
  question: string;
  options: string[];
  selected?: string;
  difficulty?: "easy" | "medium" | "hard";
  onSelect: (label: string, text: string) => void;
}

const difficultyStyle: Record<string, string> = {
  easy:   "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  hard:   "bg-red-100 text-red-600",
};

export default function QuizQuestion({ index, question, options, selected, difficulty, onSelect }: Props) {
  const getLabel = (i: number) => String.fromCharCode(65 + i);

  return (
    <div className="mb-6 p-4 border rounded-lg">
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="font-semibold flex-1">
          {index + 1}. {question}
        </p>
        {difficulty && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${difficultyStyle[difficulty] ?? ""}`}>
            {difficulty}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {options.map((opt, i) => {
          const label      = getLabel(i);
          const isSelected = selected === label;

          return (
            <label
              key={i}
              className={`flex items-center gap-2 p-2 rounded cursor-pointer border transition ${
                isSelected ? "border-indigo-500 bg-indigo-50" : "border-transparent hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name={`q-${index}`}
                checked={isSelected}
                onChange={() => onSelect(label, opt)}
                className="accent-indigo-600"
              />
              <span className="text-gray-500 font-medium mr-1">{label}.</span>
              {opt}
            </label>
          );
        })}
      </div>
    </div>
  );
}

interface Props {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  label?: string;
}

export default function SubmitButton({ onClick, loading, disabled, label = "Submit Quiz" }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className="w-full mt-4 bg-green-600 text-white py-3 rounded-md font-semibold hover:bg-green-700 disabled:opacity-50 transition"
    >
      {loading ? "Submitting..." : label}
    </button>
  );
}

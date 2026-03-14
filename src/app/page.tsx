
// import Link from "next/link";

// export default function HomePage() {
//   return (
//     <main className="min-h-screen bg-red-500">
//       <div className="p-8">
//         <h1 className="text-4xl font-bold text-white">Test Tailwind</h1>
//         <p className="text-white mt-4">If you see red background and white text, Tailwind is working!</p>
//       </div>
      
//       {/* HERO SECTION */}
//       <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
//         <div className="max-w-7xl mx-auto px-6 py-20 text-center">
//           <h1 className="text-4xl md:text-5xl font-bold mb-6">
//             AI-Powered JavaScript Learning Platform
//           </h1>
//           <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto">
//             Learn JavaScript step-by-step with interactive lessons, automatically
//             generated quizzes, and personalized learning paths.
//           </p>

//           <div className="flex justify-center gap-4">
//             <Link
//               href="/login"
//               className="bg-white text-indigo-600 px-6 py-3 rounded-md font-semibold hover:bg-gray-100"
//             >
//               Login
//             </Link>
//             <Link
//               href="/register"
//               className="border border-white px-6 py-3 rounded-md font-semibold hover:bg-white hover:text-indigo-600"
//             >
//               Register
//             </Link>
//           </div>
//         </div>
//       </section>

//       {/* ABOUT JAVASCRIPT */}
//       <section className="py-16 px-6 max-w-7xl mx-auto">
//         <h2 className="text-3xl font-bold text-center mb-8">
//           Why Learn JavaScript?
//         </h2>

//         <p className="text-gray-600 text-center max-w-4xl mx-auto">
//           JavaScript is one of the most popular programming languages used for
//           building interactive websites, web applications, and modern software.
//           It is essential for frontend development and widely used in backend
//           and full-stack development.
//         </p>
//       </section>

//       {/* FEATURES */}
//       <section className="bg-white py-16 px-6">
//         <div className="max-w-7xl mx-auto">
//           <h2 className="text-3xl font-bold text-center mb-12">
//             Platform Features
//           </h2>

//           <div className="grid md:grid-cols-3 gap-8">
//             <FeatureCard
//               title="Structured Learning"
//               description="Well-organized JavaScript lessons from basics to advanced concepts."
//             />
//             <FeatureCard
//               title="Automatic Quiz Generation"
//               description="Quizzes are generated automatically after each lesson to test understanding."
//             />
//             <FeatureCard
//               title="Performance Evaluation"
//               description="Track scores and accuracy to understand learning progress."
//             />
//             <FeatureCard
//               title="Personalized Feedback"
//               description="Get suggestions based on weak areas and performance trends."
//             />
//             <FeatureCard
//               title="Career Roadmap"
//               description="Guidance for next technologies like React, Node.js, and TypeScript."
//             />
//             <FeatureCard
//               title="AI-Assisted Learning"
//               description="Smart evaluation and adaptive learning experience."
//             />
//           </div>
//         </div>
//       </section>

//       {/* CALL TO ACTION */}
//       <section className="py-16 px-6 text-center">
//         <h2 className="text-3xl font-bold mb-4">
//           Start Your JavaScript Journey Today
//         </h2>
//         <p className="text-gray-600 mb-6">
//           Register now and experience intelligent learning powered by AI.
//         </p>

//         <Link
//           href="/register"
//           className="bg-indigo-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-indigo-700"
//         >
//           Get Started
//         </Link>
//       </section>
//     </main>
//   );
// }

// /* Reusable Feature Card */
// function FeatureCard({
//   title,
//   description,
// }: {
//   title: string;
//   description: string;
// }) {
//   return (
//     <div className="border rounded-lg p-6 shadow-sm hover:shadow-md transition">
//       <h3 className="text-xl font-semibold mb-3">{title}</h3>
//       <p className="text-gray-600">{description}</p>
//     </div>
//   );
// }
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* HERO SECTION */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            AI-Powered JavaScript Learning Platform
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto">
            Learn JavaScript step-by-step with interactive lessons, automatically
            generated quizzes, and personalized learning paths.
          </p>

          <div className="flex justify-center gap-4">
            <Link
              href="/login"
              className="bg-white text-indigo-600 px-6 py-3 rounded-md font-semibold hover:bg-gray-100"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="border border-white px-6 py-3 rounded-md font-semibold hover:bg-white hover:text-indigo-600"
            >
              Register
            </Link>
          </div>
        </div>
      </section>

      {/* ABOUT JAVASCRIPT */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">
          Why Learn JavaScript?
        </h2>

        <p className="text-gray-600 text-center max-w-4xl mx-auto">
          JavaScript is one of the most popular programming languages used for
          building interactive websites, web applications, and modern software.
          It is essential for frontend development and widely used in backend
          and full-stack development.
        </p>
      </section>

      {/* FEATURES */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Platform Features
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              title="Structured Learning"
              description="Well-organized JavaScript lessons from basics to advanced concepts."
            />
            <FeatureCard
              title="Automatic Quiz Generation"
              description="Quizzes are generated automatically after each lesson to test understanding."
            />
            <FeatureCard
              title="Performance Evaluation"
              description="Track scores and accuracy to understand learning progress."
            />
            <FeatureCard
              title="Personalized Feedback"
              description="Get suggestions based on weak areas and performance trends."
            />
            <FeatureCard
              title="Career Roadmap"
              description="Guidance for next technologies like React, Node.js, and TypeScript."
            />
            <FeatureCard
              title="AI-Assisted Learning"
              description="Smart evaluation and adaptive learning experience."
            />
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="py-16 px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Start Your JavaScript Journey Today
        </h2>
        <p className="text-gray-600 mb-6">
          Register now and experience intelligent learning powered by AI.
        </p>

        <Link
          href="/register"
          className="bg-indigo-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-indigo-700"
        >
          Get Started
        </Link>
      </section>
    </main>
  );
}

/* Reusable Feature Card */
function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border rounded-lg p-6 shadow-sm hover:shadow-md transition">
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

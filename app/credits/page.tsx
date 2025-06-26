export default function CreditsPage() {
  const people = [
    { github: 'SWM-2', name: 'Anthony Cieslik' },
    { github: 'mattadosss', name: 'Matteo Weber' },
    { github: 'Hari-42', name: 'Harisaran Mohanathas' },
    { github: 'im23b-terenzianie', name: 'Enzo Terenziani' },
    { github: 'koskogo', name: 'Theodor Schneider' },
    { github: 'marc-zh', name: 'Marc Holenstein' },
  ];

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Credits</h1>
      <ul className="space-y-6">
        {people.map((person) => (
          <li key={person.github} className="flex items-center gap-4 bg-white rounded-lg shadow p-4">
            <img
              src={`https://github.com/${person.github}.png`}
              alt={person.name}
              className="w-12 h-12 rounded-full border"
            />
            <div>
              <a
                href={`https://github.com/${person.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-lg text-primary hover:underline"
              >
                {person.github}
              </a>
              <div className="text-gray-600 text-sm">{person.name}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 
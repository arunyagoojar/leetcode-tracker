// Inside the App component
import React, { useEffect, useState } from 'react';
import './App.css';
import problemsData from './assets/problems.json';
import logo from './assets/logo.png';

function ProblemRow({ problem, onStarClick, onCheckClick }) {
  return (
    <tr className={problem.isCompleted ? 'completed' : ''}>
      <td>
        <span
          className={`star ${problem.isStarred ? 'golden' : ''}`}
          onClick={() => onStarClick(problem)}
          role="img"
          aria-label="Star"
        >
          ✩
        </span>
      </td>

      {Object.entries(problem).map(([key, value]) => {
        if (key === 'name') {
          return (
            <td key={key} className="problem-name">
              <a
                href={problem.link}
                target="_blank"
                rel="noopener noreferrer"
                className={problem.isCompleted ? 'completed' : ''}
              >
                {value}
              </a>
            </td>
          );
        } else if (key === 'solution') {
          const url = value.match(/\(([^)]+)\)/)[1];
          return (
            <td key={key} className="solution-link">
              <a href={url} target="_blank" rel="noopener noreferrer">
                🔗
              </a>
            </td>
          );
        } else if (key === 'difficulty') {
          return <td key={key} className={`difficulty ${value}`}>{value}</td>;
        } else if (key !== 'link' && key !== 'isStarred' && key !== 'isCompleted') { // Exclude 'isStarred' and 'isCompleted'
          return <td key={key}>{value}</td>;
        }
      })}

      <td className="checkbox-col">
        <input
          type="checkbox"
          checked={problem.isCompleted}
          onChange={() => onCheckClick(problem)}
        />
      </td>
    </tr>
  );
}

function App() {
  const [originalProblems, setOriginalProblems] = useState([]);
  const [problems, setProblems] = useState([]);
  const [filter, setFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const problemsPerPage = 10;

  useEffect(() => {
    const problemsWithStars = problemsData.map(problem => {
      const storedProblem = JSON.parse(localStorage.getItem(`starred_${problem.name}`));
      const storedCompleted = JSON.parse(localStorage.getItem(`completed_${problem.name}`));
      return {
        ...problem,
        isStarred: storedProblem ? storedProblem.isStarred : false,
        isCompleted: storedCompleted ? storedCompleted.isCompleted : false
      };
    });

    setOriginalProblems(problemsWithStars);
    setProblems(problemsWithStars);
  }, []);

  const filterProblems = (event) => {
    const value = event.target.value;
    setFilter(value);
    setProblems(originalProblems);

    if (value !== 'All') {
      const filteredProblems = originalProblems.filter((problem) => problem.difficulty === value);
      setProblems(filteredProblems);
    }
  };

  const handleStarClick = (clickedProblem) => {
    const updatedProblems = problems.map((problem) =>
      problem === clickedProblem
        ? { ...problem, isStarred: !problem.isStarred }
        : problem
    );

    setProblems(updatedProblems);

    const updatedOriginalProblems = originalProblems.map((problem) =>
      problem.name === clickedProblem.name
        ? { ...problem, isStarred: !problem.isStarred }
        : problem
    );

    setOriginalProblems(updatedOriginalProblems);

    localStorage.setItem(`starred_${clickedProblem.name}`, JSON.stringify({ isStarred: !clickedProblem.isStarred }));
  };

  const handleCheckClick = (clickedProblem) => {
    const updatedProblems = problems.map(problem => {
      if (problem === clickedProblem) {
        return { ...problem, isCompleted: !problem.isCompleted };
      }
      return problem;
    });

    setProblems(updatedProblems);

    const updatedOriginalProblems = originalProblems.map(problem => {
      if (problem.name === clickedProblem.name) {
        return { ...problem, isCompleted: !problem.isCompleted };
      }
      return problem;
    });

    setOriginalProblems(updatedOriginalProblems);

    localStorage.setItem(
      `completed_${clickedProblem.name}`,
      JSON.stringify({ isCompleted: !clickedProblem.isCompleted })
    );
  };

  const indexOfLastProblem = currentPage * problemsPerPage;
  const indexOfFirstProblem = indexOfLastProblem - problemsPerPage;
  const currentProblems = problems.slice(indexOfFirstProblem, indexOfLastProblem);

  const handlePageChange = (event) => {
    const newPageNumber = Number(event.target.id);
    if (newPageNumber >= 1 && newPageNumber <= pageNumbers.length) {
      setCurrentPage(newPageNumber);
    }
  };

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(problems.length / problemsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <>
      <div className="container">
        <img className='logo' src={logo} />
        <table id="problemsTable" className='table'>
          <thead>
            <tr className='tr'>
              <th>Star</th>
              {Object.keys(problems[0] || {}).filter((header) => header !== 'link' && header !== 'isStarred' && header !== 'isCompleted').map((header) => ( // Exclude 'isCompleted'
                <th key={header}>
                  {header !== 'difficulty' ? (
                    header === 'name' ? 'Problem' : header
                  ) : (
                    <select onChange={filterProblems}>
                      <option value="All">Difficulty</option>
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  )}
                </th>
              ))}
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {currentProblems.map((problem, index) => (
              <ProblemRow
                key={index}
                problem={problem}
                onStarClick={handleStarClick}
                onCheckClick={handleCheckClick}
              />
            ))}
          </tbody>
        </table>
        <div id="page-numbers">
          <button
            disabled={currentPage === 1}
            onClick={() => handlePageChange({ target: { id: currentPage - 1 } })}
          >
            ⏪
          </button>
          <span>{currentPage}</span>
          <button
            disabled={currentPage === pageNumbers.length}
            onClick={() => handlePageChange({ target: { id: currentPage + 1 } })}
          >
            ⏩
          </button>
        </div>
      </div>
    </>
  );
}

export default App;

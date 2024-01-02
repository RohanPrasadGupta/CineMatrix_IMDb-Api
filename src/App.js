import { useEffect, useState } from "react";
import "./App.css";
import StarRating from "./StarsRating";

const KEY = "59c90268";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  function ClickSelectedMovie(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }

  function CloseSelectedMovie() {
    setSelectedId(null);
  }

  function handleWatchedMovie(movie) {
    setWatched((watched) => [...watched, movie]);
  }

  function onWatchedDelete(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  useEffect(
    function () {
      const controller = new AbortController();

      async function FetchMovieData() {
        try {
          setLoading(true);
          setError("");
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal }
          );

          if (!res.ok) throw new Error("SomeThing Went Wrong...");

          const data = await res.json();
          //console.log(data);

          if (data.Response === "False") throw new Error(data.Error);

          setMovies(data.Search);
          setError("");

          //console.log(data.Search);
        } catch (err) {
          if (err.name !== "AbortError") {
            setError(err.message);
          }
        } finally {
          setLoading(false);
        }
      }

      if (query.length <= 3) {
        setMovies([]);
        setError("");
        CloseSelectedMovie();
        return;
      }

      FetchMovieData();

      return function () {
        controller.abort();
      };
    },
    [query]
  );

  return (
    <>
      <Navbar>
        <Logo />
        <SearchMovie query={query} setQuery={setQuery} />
        <FoundMovie movies={movies} />
      </Navbar>

      <Main>
        {/*
        <Box element={<MoviesList movies={movies}></MoviesList>} />

        <Box
          element={
            <>
              <WatchedSummary watched={watched} />
              <WatchedMovieList watched={watched} />
            </>
          }
        />

         UPPER WAY as a Prop OR THE BELOW as a children
        */}

        <Box>
          {/* {loading ? <Loader /> : <MoviesList movies={movies} />} */}

          {loading && <Loader />}
          {!loading && !error && (
            <MoviesList movies={movies} onMovieSelect={ClickSelectedMovie} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>

        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseSelectMovie={CloseSelectedMovie}
              onAddWatched={handleWatchedMovie}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMovieList
                watched={watched}
                onDeleteWatchedMovie={onWatchedDelete}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Loader() {
  return <p>LOADING...</p>;
}

function ErrorMessage({ message }) {
  return (
    <>
      <span className=" mt-6"> ⛔</span> {message}
    </>
  );
}

function Navbar({ children }) {
  return (
    <nav className=" p-3 bg-purple-700 w-screen fixed flex flex-row  justify-between items-center">
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className=" flex flex-row ml-3">
      <span className=" text-3xl ml-10" role="img">
        🍟
      </span>
      <h1 className=" ml-5 text-white text-3xl font-bold">Cine Matrix</h1>
    </div>
  );
}

function SearchMovie({ query, setQuery }) {
  return (
    <input
      type="text"
      className=" p-2 w-auto rounded-lg border-solid border-2 border-black "
      placeholder="Enter Movie Name..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function FoundMovie({ movies }) {
  return (
    <h1 className=" text-white text-3xl font-bold mr-3">
      {movies.length} Movie Found
    </h1>
  );
}

function Main({ children }) {
  return (
    <div className=" p-6 bg-black/80 h-screen  grid grid-cols-2  text-center">
      {children}
    </div>
  );
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div
      className={` w-[70%] rounded-2xl mt-20  shadow-lg bg-black/50 text-white ml-28 overflow-auto `}
    >
      <button onClick={() => setIsOpen((cur) => !cur)}>
        {isOpen === true ? "➖" : "➕"}
      </button>
      {isOpen && children}
    </div>
  );
}

function MoviesList({ movies, onMovieSelect }) {
  return (
    <ul>
      {movies.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onMovieSelect={onMovieSelect} />
      ))}
    </ul>
  );
}

function Movie({ movie, onMovieSelect }) {
  return (
    <li className=" cursor-pointer" onClick={() => onMovieSelect(movie.imdbID)}>
      <div className=" grid grid-cols-2 m-2 bg-black/30 p-3 rounded-lg items-center">
        <div>
          <img
            className=" w-20 h-28 rounded-xl"
            src={movie.Poster}
            alt={movie.Title}
          />
        </div>
        <div className=" flex flex-col text-center -ml-28">
          <p>{movie.Title}</p>
          <span>📅 {movie.Year}</span>
        </div>
      </div>
    </li>
  );
}

// WRAPED INSIDE THE BOX COMPONENT

// function WatchedMovieRight() {
//   const [isOpen2, setIsOpen2] = useState(true);
//   const [watched, setWatched] = useState(tempWatchedMovieData);

//   function isOpen2Function() {
//     setIsOpen2((cur) => !cur);
//   }
//   return (
//     <div>
//       <div className="max-w-sm  overflow-hidden shadow-lg bg-black/50 text-white rounded-2xl">
//         <button onClick={isOpen2Function}>
//           {isOpen2 === true ? "➖" : "➕"}
//         </button>
//         {isOpen2 === true ? (
//           <>
//             <WatchedSummary watched={watched} />
//             <WatchedMovieList watched={watched} />
//           </>
//         ) : (
//           <></>
//         )}
//       </div>
//     </div>
//   );
// }

function WatchedSummary({ watched }) {
  const avgImdRating = Math.round(
    average(watched.map((movie) => movie.imdbRating))
  );
  const avgUserRating = Math.round(
    average(watched.map((movie) => movie.userRating))
  );
  const avgRunTime = Math.round(average(watched.map((movie) => movie.runtime)));

  return (
    <div className=" rounded overflow-hidden shadow-lg bg-black/40 p-2 mb-6">
      <div className=" m-2">
        <h1>MOVIES YOU WATCHED</h1>
      </div>
      <div>
        <span>😎 {watched.length} movies </span>
        <span>⭐ {avgImdRating.toFixed(2)} User Rating </span>
        <span>🌟 {avgUserRating.toFixed(2)} IMDB Rating </span>
        <span>🕓 {avgRunTime} Mins </span>
      </div>
    </div>
  );
}

function WatchedMovieList({ watched, onDeleteWatchedMovie }) {
  return (
    <ul>
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          onDeleteWatchedMovie={onDeleteWatchedMovie}
        />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, onDeleteWatchedMovie }) {
  return (
    <li>
      <div className=" grid grid-cols-2 m-2 items-center bg-black/30 p-2 ">
        <div>
          <img
            className=" w-20 h-28 rounded-xl"
            src={movie.poster}
            alt={movie.title}
          />
        </div>
        <div className=" flex flex-col text-left gap-1 -ml-10 mb-2">
          <p className=" font-bold text-2xl">{movie.title}</p>
          <div className=" flex flex-row gap-3">
            <p> ⭐ {movie.imdbRating}</p>
            <p className=" ml-2 mr-2"> 🌟 {movie.userRating}</p>
            <p> ⌛ {movie.runtime}</p>

            <button onClick={() => onDeleteWatchedMovie(movie.imdbID)}>
              &#10060;
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

function MovieDetails({
  selectedId,
  onCloseSelectMovie,
  onAddWatched,
  watched,
}) {
  const [movie, setMovie] = useState({});
  const [loading, setLoading] = useState(false);
  const [userRating, setUserRating] = useState("");

  const isAlreadyRated = watched
    .map((movie) => movie.imdbID)
    .includes(selectedId);

  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  useEffect(
    function () {
      setLoading(true);
      async function getMovieDetails() {
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
        );
        const data = await res.json();
        setLoading(false);
        setMovie(data);

        //console.log(data);
      }
      getMovieDetails();
    },
    [selectedId]
  );

  function handleAddWatched() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
    };

    onAddWatched(newWatchedMovie);
    onCloseSelectMovie();

    // console.log(newWatchedMovie);
  }

  useEffect(
    function () {
      function callback(e) {
        if (e.code === "Escape") {
          onCloseSelectMovie();
          console.log("Close");
        }
      }

      document.addEventListener("keydown", callback);

      document.removeEventListener("keydown", callback);
    },
    [onCloseSelectMovie]
  );

  useEffect(
    function () {
      if (!title) return;

      document.title = `MOVIE : ${title}`;

      return function () {
        document.title = "Cine Matrix";
      };
    },
    [title]
  );

  return (
    <div>
      <div className=" m-4 p-1 cursor-pointer border-2 w-10 h-10 rounded-xl hover:-translate-y-1 ">
        <button className=" items-center" onClick={onCloseSelectMovie}>
          &larr;
        </button>
      </div>
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className=" grid grid-cols-2 p-3 gap-3">
            <div>
              <img
                className=" h-48 w-36 rounded-md shadow-2xl"
                src={poster}
                alt={title}
              />
            </div>
            <div className=" flex flex-col gap-2 mt-6 mr-14">
              <p className=" text-3xl font-bold capitalize underline underline-offset-4">
                {title}
              </p>
              <p>
                {released} &bull;
                <span className=" mr-3">{runtime}</span>
              </p>
              <h3>{genre}</h3>
              <h3>
                ⭐{imdbRating}
                <span> IMDb Rating</span>
              </h3>
            </div>
          </div>

          <section className=" flex flex-col p-2">
            <div className=" bg-black/50 p-4  flex flex-col items-center h-16 mb-2">
              {!isAlreadyRated ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button
                      className=" bg-green-400 mt-3 font-bold rounded-lg p-2 text-black"
                      onClick={handleAddWatched}
                    >
                      + Add To Watched List
                    </button>
                  )}
                </>
              ) : (
                <p>You have already rated it..{watchedUserRating}⭐ </p>
              )}
            </div>

            <div className=" mt-8">{plot}</div>
            <div>
              <p className=" mt-2 text-fuchsia-600 ">Staring : {actors}</p>
              <p className=" mb-2 text-fuchsia-400">Directed by : {director}</p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

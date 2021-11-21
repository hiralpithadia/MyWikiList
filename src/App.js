import React, { useState, useRef } from "react";
import "./App.css";

function App() {
  const refArr = useRef([]);
  refArr.current = [];
  const [articleList, setArticleList] = useState([{}]); // State for showing all Articles in dataList
  const [selectedArticles, setSelectedArticles] = useState([{ title: "" }]); // State to add all selected Articles
  const [updateSelectedArticles, setUpdateSelectedArticles] = useState([]); // State to store updated Articles after deleting & selecting new articles.

  // Select Articles input field onChange function
  const onChange = (event) => {
    let value = event.target.value;
    if (value !== "") {
      let url = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&uselang=user&prop=extracts%7Cpageprops%7Cinfo&generator=prefixsearch&redirects=1&exsentences=1&exintro=1&explaintext=1&inprop=url&gpssearch=${encodeURIComponent(
        value
      )}`;
      fetch(url)
        .then((res) => res.json())
        .then(
          (json) => {
            if (json.query && json.query.pages) {
              // Filter articles based on condition if discriptions is present & pageprops.disambiguation not present.
              var articleList = Object.values(json.query.pages)
                .filter(
                  (article) =>
                    (article.pageprops["wikibase-shortdesc"] ||
                      article.extract) &&
                    article.pageprops.disambiguation === undefined &&
                    !selectedArticles.some(
                      (art) => art && art.title === article.title
                    )
                )
                // sorting articles to get correct order in autocomplete datalist list.
                .sort((x, y) => {
                  if (x.title.toLowerCase() > y.title.toLowerCase()) {
                    return 1;
                  } else if (x.title.toLowerCase() < y.title.toLowerCase()) {
                    return -1;
                  }
                  return 0;
                });
              setArticleList(articleList);
            }
          },
          (error) => {
            console.error(error);
          }
        );
    }
  };

  // Select Articles onKeyUp event
  const handleSelectArticle = (event, index) => {
    const value = event.target.value;
    if (value !== "") {
      // event.preventDefault();
      var filterSelectedArticle = Object.values(articleList).filter(
        (article) => article.title === value
      );

      if (filterSelectedArticle.length) {
        selectedArticles[index] = filterSelectedArticle[0];
        if (index === selectedArticles.length - 1) {
          setSelectedArticles((prevState) => [...prevState, { title: "" }]);
          setArticleList([]);
        }
      }
    }
  };

  // Delete button onClick event function
  const handleDeleteArticle = (index) => {
    let deepCloneArticles = JSON.parse(JSON.stringify(selectedArticles));
    deepCloneArticles.splice(index, 1);
    for (var i = 0; i < deepCloneArticles.length; i++) {
      refArr.current[i].value = deepCloneArticles[i].title;
    }
    refArr.current[deepCloneArticles.length - 1].focus();
    setSelectedArticles([
      ...selectedArticles.slice(0, index),
      ...selectedArticles.slice(index + 1),
    ]);
  };

  // Submit button function
  const handleSubmitButton = () => {
    let deepCloneArticles = JSON.parse(JSON.stringify(selectedArticles));
    setUpdateSelectedArticles(deepCloneArticles);
  };

  // Set refs for input fields
  const addToRefs = (el, index) => {
    if (el) {
      refArr.current[index] = el;
    }
  };

  // Dynamically add Table Row child component
  const addInputList = () =>
    selectedArticles.map((selectedArt, index) => (
      <tr key={`tr_${index}`}>
        <td>
          <input
            id={`id_${index}`}
            ref={(el) => addToRefs(el, index)}
            type="text"
            list={"data" + index}
            defaultValue=""
            onChange={(event) => onChange(event)}
            onKeyUp={(event) => handleSelectArticle(event, index)}
            placeholder="Select an article"
          />
          <datalist autoComplete="on" id={`data` + index}>
            {Object.values(articleList).map((article, index) => (
              <option key={`${article.title}_${index}`} value={article.title} />
            ))}
          </datalist>
        </td>
        <td>
          <input
            className="desc"
            type="text"
            disabled
            value={
              selectedArt &&
              (selectedArt.pageprops || selectedArt.extract
                ? selectedArt.pageprops["wikibase-shortdesc"] ||
                  selectedArt.extract
                : "")
            }
          />
        </td>
        <td>
          <button
            type="button"
            disabled={index === selectedArticles.length - 1}
            onClick={() => handleDeleteArticle(index)}
          >
            Delete
          </button>
        </td>
      </tr>
    ));

  return (
    <div className="App">
      <header>My Wiki List</header>
      <section className="creator">
        <article>
          <table>
            <thead>
              <tr>
                <th>Article</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>{addInputList()}</tbody>
            <tfoot>
              <tr>
                <td colSpan={3}>
                  {selectedArticles.length > 1
                    ? selectedArticles.length - 1
                    : "No"}{" "}
                  items
                </td>
              </tr>
            </tfoot>
          </table>
          {selectedArticles.length > 1 && (
            <footer>
              <button type="button" onClick={handleSubmitButton}>
                Submit
              </button>
            </footer>
          )}
        </article>
      </section>

      {updateSelectedArticles.length > 1 && (
        <section className="result">
          <p style={{ textAlign: "center", fontWeight: "bold" }}>Result View</p>
          <header>My Wiki List</header>
          {updateSelectedArticles.map(
            (article, index) =>
              article.title !== "" &&
              Object.keys(article).length > 0 && (
                <article key={`${article.title}_${index}`}>
                  <h1>{article.title}</h1>
                  <p>{article.extract}</p>
                  <a
                    href={article.fullurl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {article.fullurl}
                  </a>
                </article>
              )
          )}
        </section>
      )}
    </div>
  );
}

export default App;

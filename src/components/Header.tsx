import logo from "../logo.svg";

/**
 * The app bar: mark, wordmark, credit. Same two parts in the same order and
 * the same credit line as the sibling projects wear, so they read as a set.
 *
 * The mark is decorative — `alt=""` rather than a description — because the
 * title it sits beside already says the app's name, and a screen reader
 * announcing "Wordle Helper logo, Wordle Helper" is worse than announcing it
 * once.
 */
const Header = () => (
  <header className="app-header">
    <img className="logo" src={logo} alt="" />

    <div className="header-text">
      <p className="title">Wordle Helper</p>
      <a
        className="credit"
        href="https://github.com/dangervalentine/WordleCheater"
        target="_blank"
        rel="noopener noreferrer"
      >
        <p>by Danger Valentine</p>
      </a>
    </div>
  </header>
);

export default Header;

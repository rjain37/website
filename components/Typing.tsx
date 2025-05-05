import * as React from "react";

const Typing = ({ children }: { children: string[] }) => {
  const [typed, setTyped] = React.useState("");
  const [backwards, setBackwards] = React.useState(false);
  const [wordIdx, setWordIdx] = React.useState(0);
  
  // Use useMemo to prevent prefixes array from being recreated on every render
  const prefixes = React.useMemo(() => {
    const result: string[] = [];
    for (let i = 1; i < children.length; i++) {
      for (let j = 0; j < children[i].length && j < children[i - 1].length; j++) {
        if (children[i][j] !== children[i - 1][j]) {
          result.push(children[i].substring(0, j));
          break;
        }
      }
    }
    // Add the last child at the end
    result.push(children[children.length - 1]);
    return result;
  }, [children]);
  React.useEffect(() => {
    if (typed.length !== children[wordIdx].length) {
      if (backwards) {
        setTimeout(() => {
          const cut = typed.slice(0, -1);
          if (cut === prefixes[wordIdx]) {
            setWordIdx(wordIdx + 1);
            setBackwards(false);
            setTyped(cut);
          } else {
            setTyped(cut);
          }
        }, 50);
      } else {
        setTimeout(() => {
          setTyped(typed + children[wordIdx][typed.length]);
        }, 50);
      }
    } else {
      setTimeout(() => {
        setBackwards(true);
        if (wordIdx !== children.length - 1) {
          setTyped(typed.slice(0, -1));
        }
      }, 2000);
    }
  }, [typed, backwards, children, prefixes, wordIdx]);

  return (
    <>
      {typed}
      <span
        className={
          "cursor-blink inline-block -translate-y-0.5 text-[0.75em] font-semibold"
        }
      >
        |
      </span>
    </>
  );
};

export default Typing;

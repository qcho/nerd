import React from "react";

type TextNodeProps = {
  text: string;
};

const TextNode = (props: TextNodeProps) => {
  return (
    <span
      style={{
        height: 32,
        display: "inline-block",
        marginLeft: 2,
        marginRight: 2
      }}
    >
      {props.text}
    </span>
  );
};

export default TextNode;

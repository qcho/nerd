import React from "react";

type TextNodeProps = {
  text: string;
};

const TextNode = (props: TextNodeProps) => {
  return (
    <h1
      style={{
        height: 32,
        display: "inline-block",
        marginLeft: 1,
        marginRight: 1
      }}
    >
      {props.text}
    </h1>
  );
};

export default TextNode;

import React from "react"
import styled from "styled-components"

export default function ArrowButton({ className, onClick, children }) {
  return (
    <Holder className={className} onClick={onClick}>
      {children}
    </Holder>
  )
}

const Holder = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border-radius: 5px;
  width: 2.2em;
  height: 5em;
  background-color: rgb(27, 27, 27);
  &:hover {
    background-color: rgb(44, 44, 44);
  }
`

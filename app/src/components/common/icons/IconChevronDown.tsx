import React from 'react'

interface Props {
  color?: string
}

export const IconChevronDown = (props: Props) => {
  const { color = '#7986CB' } = props
  return (
    <svg
      className="chevronDown"
      fill="none"
      height="24"
      viewBox="0 0 24 24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M7.41 8.59L12 13.17L16.59 8.59L18 10L12 16L6 10L7.41 8.59Z" fill={color} />
    </svg>
  )
}

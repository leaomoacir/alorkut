function CustomizedInput(propriedades) {
  return (
    <input
      placeholder={propriedades.placeholder}
      name={propriedades.name}
      aria-label={propriedades['aria-label'] || propriedades.ariaLabel}
      type="text"
      value={propriedades.value}
      onChange={(e) => propriedades.onValueChange(e.target.value)}
      required={propriedades.required !== false}
    />
  )
}

export default CustomizedInput

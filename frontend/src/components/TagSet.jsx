function TagSet({ tags, isSelected, onSelect }) {
  return (
    <div className="tag-set">
      {tags.map(({ label, icon }) => (
        <button
          key={label}
          type="button"
          className={`tag-btn${isSelected(label) ? ' selected' : ''}`}
          onClick={() => onSelect(label)}
        >
          <span className="tag-icon">{icon}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  )
}

export default TagSet

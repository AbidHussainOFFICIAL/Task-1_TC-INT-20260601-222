import { Star } from 'phosphor-react';

export default function StarPicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0 2px',
            color: star <= value ? '#f59e0b' : '#cbd5e1',
            transition: 'color 0.15s ease, transform 0.1s ease',
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.2)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          <Star size={28} weight={star <= value ? 'fill' : 'regular'} />
        </button>
      ))}
    </div>
  );
}

export default function PortfolioItem({ item }) {
  const raw = (item.url || '').trim();
  if (!raw) {
    return (
      <div style={{border:'1px solid #e6e6e6', padding:12, borderRadius:8, marginBottom:8}}>
        <h4 style={{margin:0}}>{item.title}</h4>
        <p style={{margin:'6px 0'}}>{item.description}</p>
      </div>
    );
  }

  const href = /^(https?:)?\/\//i.test(raw) || /^https?:/i.test(raw) ? raw : `https://${raw}`;
  const safeHref = encodeURI(href);
  let isValidUrl = true;
  try {
    // Validate the final URL
    // new URL will throw for malformed hosts (like spaces)
    // Use the encoded href so it's a proper URI
    // If this fails, we won't render a clickable link.
    new URL(safeHref);
  } catch {
    isValidUrl = false;
  }

  return (
    <div style={{border:'1px solid #e6e6e6', padding:12, borderRadius:8, marginBottom:8}}>
      <h4 style={{margin:0}}>{item.title}</h4>
      <p style={{margin:'6px 0'}}>{item.description}</p>
      {isValidUrl ? (
        <a href={safeHref} target="_blank" rel="noreferrer">View</a>
      ) : (
        <span style={{color:'#6b7280'}}>Invalid URL</span>
      )}
    </div>
  );
}

export default function PortfolioItem({ item }) {
  return (
    <div style={{border:'1px solid #e6e6e6', padding:12, borderRadius:8, marginBottom:8}}>
      <h4 style={{margin:0}}>{item.title}</h4>
      <p style={{margin:'6px 0'}}>{item.description}</p>
      {item.url && <a href={item.url} target="_blank" rel="noreferrer">View</a>}
    </div>
  );
}

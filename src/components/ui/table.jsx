export function Table({ className = "", ...props }) {
  return (
    <div className="relative w-full overflow-x-auto rounded-xl border border-border">
      <table
        className={`w-full border-collapse text-sm ${className}`}
        {...props}
      />
    </div>
  );
}

export const THead = (props) => (
  <thead className="bg-muted text-muted-foreground" {...props} />
);

export const TBody = (props) => (
  <tbody className="divide-y divide-border" {...props} />
);

export const TR = ({ className = "", ...props }) => (
  <tr
    className={`hover:bg-accent transition ${className}`}
    {...props}
  />
);

export const TH = (props) => (
  <th className="px-4 py-3 text-left font-medium" {...props} />
);

export const TD = (props) => (
  <td className="px-4 py-3" {...props} />
);

// Usage
{/* <Table>
  <THead>
    <TR>
      <TH>Name</TH>
      <TH>Status</TH>
      <TH>Created</TH>
    </TR>
  </THead>
  <TBody>
    <TR>
      <TD>SCEI Program</TD>
      <TD><Badge variant="primary">Active</Badge></TD>
      <TD>2025-01-01</TD>
    </TR>
  </TBody>
</Table> */}

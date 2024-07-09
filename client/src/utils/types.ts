export type Child = React.ReactElement | string | number;

export type Children = Child | (Child | Children)[];

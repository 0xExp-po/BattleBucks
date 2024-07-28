export type Child = React.ReactElement | string | number;

export type Children = Child | (Child | Children)[];

export enum LanguageString {
  welcomeBack = "welcomeBack",
};

export type Language = {
  NAME: string;
  welcomeBack: string;
};

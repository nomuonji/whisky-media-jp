declare module 'astro:content' {
	interface RenderResult {
		Content: import('astro/runtime/server/index.js').AstroComponentFactory;
		headings: import('astro').MarkdownHeading[];
		remarkPluginFrontmatter: Record<string, any>;
	}
	interface Render {
		'.md': Promise<RenderResult>;
	}

	export interface RenderedContent {
		html: string;
		metadata?: {
			imagePaths: Array<string>;
			[key: string]: unknown;
		};
	}
}

declare module 'astro:content' {
	type Flatten<T> = T extends { [K: string]: infer U } ? U : never;

	export type CollectionKey = keyof AnyEntryMap;
	export type CollectionEntry<C extends CollectionKey> = Flatten<AnyEntryMap[C]>;

	export type ContentCollectionKey = keyof ContentEntryMap;
	export type DataCollectionKey = keyof DataEntryMap;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	/** @deprecated Use `getEntry` instead. */
	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E,
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	/** @deprecated Use `getEntry` instead. */
	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E,
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E,
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown,
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		slug: E,
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(
		collection: C,
		id: E,
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[],
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[],
	): Promise<CollectionEntry<C>[]>;

	export function render<C extends keyof AnyEntryMap>(
		entry: AnyEntryMap[C][string],
	): Promise<RenderResult>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C,
	): import('astro/zod').ZodEffects<
		import('astro/zod').ZodString,
		C extends keyof ContentEntryMap
			? {
					collection: C;
					slug: ValidContentEntrySlug<C>;
				}
			: {
					collection: C;
					id: keyof DataEntryMap[C];
				}
	>;
	// Allow generic `string` to avoid excessive type errors in the config
	// if `dev` is not running to update as you edit.
	// Invalid collection names will be caught at build time.
	export function reference<C extends string>(
		collection: C,
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		"blog": {
"2026-08-04-beginner-guide-types.md": {
	id: "2026-08-04-beginner-guide-types.md";
  slug: "2026-08-04-beginner-guide-types";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-08-05-budget-whisky-5.md": {
	id: "2026-08-05-budget-whisky-5.md";
  slug: "2026-08-05-budget-whisky-5";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2026-08-06-yamazaki-vs-hakushu.md": {
	id: "2026-08-06-yamazaki-vs-hakushu.md";
  slug: "2026-08-06-yamazaki-vs-hakushu";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
};

	};

	type DataEntryMap = {
		"distilleries": {
"aberfeldy": {
	id: "aberfeldy";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"aberlour": {
	id: "aberlour";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"amrut": {
	id: "amrut";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"ardbeg": {
	id: "ardbeg";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"auchentoshan": {
	id: "auchentoshan";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"balvenie": {
	id: "balvenie";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"bowmore": {
	id: "bowmore";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"bruichladdich": {
	id: "bruichladdich";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"buffalo-trace": {
	id: "buffalo-trace";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"bunnahabhain": {
	id: "bunnahabhain";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"bushmills": {
	id: "bushmills";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"caol-ila": {
	id: "caol-ila";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"cardhu": {
	id: "cardhu";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"chichibu": {
	id: "chichibu";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"clynelish": {
	id: "clynelish";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"craigellachie": {
	id: "craigellachie";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"dalmore": {
	id: "dalmore";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"four-roses": {
	id: "four-roses";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"fuji-gotemba": {
	id: "fuji-gotemba";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"glen-scotia": {
	id: "glen-scotia";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"glendronach": {
	id: "glendronach";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"glenfarclas": {
	id: "glenfarclas";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"glenfiddich": {
	id: "glenfiddich";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"glenkinchie": {
	id: "glenkinchie";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"glenlivet": {
	id: "glenlivet";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"glenmorangie": {
	id: "glenmorangie";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"glenrothes": {
	id: "glenrothes";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"hakushu": {
	id: "hakushu";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"hanyu": {
	id: "hanyu";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"heaven-hill": {
	id: "heaven-hill";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"highland-park": {
	id: "highland-park";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"jack-daniels": {
	id: "jack-daniels";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"jura": {
	id: "jura";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"kavalan": {
	id: "kavalan";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"kilchoman": {
	id: "kilchoman";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"lagavulin": {
	id: "lagavulin";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"laphroaig": {
	id: "laphroaig";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"macallan": {
	id: "macallan";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"makers-mark": {
	id: "makers-mark";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"mars-shinshu": {
	id: "mars-shinshu";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"mars-tsunuki": {
	id: "mars-tsunuki";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"midleton": {
	id: "midleton";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"miyagikyo": {
	id: "miyagikyo";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"oban": {
	id: "oban";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"old-pulteney": {
	id: "old-pulteney";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"springbank": {
	id: "springbank";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"starward": {
	id: "starward";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"sullivans-cove": {
	id: "sullivans-cove";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"talisker": {
	id: "talisker";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"teeling": {
	id: "teeling";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"wild-turkey": {
	id: "wild-turkey";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"woodford": {
	id: "woodford";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"yamazaki": {
	id: "yamazaki";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
"yoichi": {
	id: "yoichi";
  collection: "distilleries";
  data: InferEntrySchema<"distilleries">
};
};
"whiskies": {
"aberfeldy-12": {
	id: "aberfeldy-12";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"aberlour-12": {
	id: "aberlour-12";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"aberlour-a-bunadh": {
	id: "aberlour-a-bunadh";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"amrut-fusion": {
	id: "amrut-fusion";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"amrut-peated": {
	id: "amrut-peated";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"ardbeg-10": {
	id: "ardbeg-10";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"ardbeg-an-oa": {
	id: "ardbeg-an-oa";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"ardbeg-uigeadail": {
	id: "ardbeg-uigeadail";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"auchentoshan-12": {
	id: "auchentoshan-12";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"auchentoshan-american-oak": {
	id: "auchentoshan-american-oak";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"ballantines-finest": {
	id: "ballantines-finest";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"balvenie-12-doublewood": {
	id: "balvenie-12-doublewood";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"balvenie-14-caribbean-cask": {
	id: "balvenie-14-caribbean-cask";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"black-nikka-clear": {
	id: "black-nikka-clear";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"black-white": {
	id: "black-white";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"bowmore-12": {
	id: "bowmore-12";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"bowmore-15": {
	id: "bowmore-15";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"bruichladdich-classic-laddie": {
	id: "bruichladdich-classic-laddie";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"buffalo-trace": {
	id: "buffalo-trace";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"bulleit-bourbon": {
	id: "bulleit-bourbon";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"bunnahabhain-12": {
	id: "bunnahabhain-12";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"bushmills-black-bush": {
	id: "bushmills-black-bush";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"bushmills-original": {
	id: "bushmills-original";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"caol-ila-12": {
	id: "caol-ila-12";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"cardhu-12": {
	id: "cardhu-12";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"chichibu-the-first": {
	id: "chichibu-the-first";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"chivas-12": {
	id: "chivas-12";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"chivas-18": {
	id: "chivas-18";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"clan-campbell": {
	id: "clan-campbell";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"clynelish-14": {
	id: "clynelish-14";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"compass-box-great-king-street": {
	id: "compass-box-great-king-street";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"craigellachie-13": {
	id: "craigellachie-13";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"cutty-sark": {
	id: "cutty-sark";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"dalmore-12": {
	id: "dalmore-12";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"dewars-white-label": {
	id: "dewars-white-label";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"eagle-rare-10": {
	id: "eagle-rare-10";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"elijah-craig-small-batch": {
	id: "elijah-craig-small-batch";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"evan-williams-black": {
	id: "evan-williams-black";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"famous-grouse": {
	id: "famous-grouse";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"famous-grouse-smoky-black": {
	id: "famous-grouse-smoky-black";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"four-roses-single-barrel": {
	id: "four-roses-single-barrel";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"four-roses-small-batch": {
	id: "four-roses-small-batch";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"four-roses-yellow": {
	id: "four-roses-yellow";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"glendronach-12": {
	id: "glendronach-12";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"glendronach-15": {
	id: "glendronach-15";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"glenfarclas-12": {
	id: "glenfarclas-12";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"glenfarclas-15": {
	id: "glenfarclas-15";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"glenfiddich-12": {
	id: "glenfiddich-12";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"glenfiddich-15": {
	id: "glenfiddich-15";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"glenkinchie-12": {
	id: "glenkinchie-12";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"glenlivet-12": {
	id: "glenlivet-12";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"glenlivet-founder-reserve": {
	id: "glenlivet-founder-reserve";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"glenmorangie-10": {
	id: "glenmorangie-10";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"glenmorangie-lasanta": {
	id: "glenmorangie-lasanta";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"glenmorangie-quinta-ruban": {
	id: "glenmorangie-quinta-ruban";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"glenrothes-vintage": {
	id: "glenrothes-vintage";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"grants-triple-wood": {
	id: "grants-triple-wood";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"green-spot": {
	id: "green-spot";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"hakushu-12": {
	id: "hakushu-12";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"hakushu-distillers-reserve": {
	id: "hakushu-distillers-reserve";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"hankey-bannister": {
	id: "hankey-bannister";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"hibiki-21": {
	id: "hibiki-21";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"hibiki-harmony": {
	id: "hibiki-harmony";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"highland-park-12": {
	id: "highland-park-12";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"highland-park-18": {
	id: "highland-park-18";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"indri-trini": {
	id: "indri-trini";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"jack-daniels": {
	id: "jack-daniels";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"jameson": {
	id: "jameson";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"jim-beam-white": {
	id: "jim-beam-white";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"johnnie-walker-black": {
	id: "johnnie-walker-black";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"johnnie-walker-blue": {
	id: "johnnie-walker-blue";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"johnnie-walker-double-black": {
	id: "johnnie-walker-double-black";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"johnnie-walker-red": {
	id: "johnnie-walker-red";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"jura-10": {
	id: "jura-10";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"kakubin": {
	id: "kakubin";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"kavalan-classic": {
	id: "kavalan-classic";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"kavalan-concertmaster": {
	id: "kavalan-concertmaster";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"kavalan-solist-sherry": {
	id: "kavalan-solist-sherry";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"kilchoman-machir-bay": {
	id: "kilchoman-machir-bay";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"knob-creek": {
	id: "knob-creek";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"lagavulin-16": {
	id: "lagavulin-16";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"lagavulin-8": {
	id: "lagavulin-8";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"laphroaig-10": {
	id: "laphroaig-10";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"laphroaig-quarter-cask": {
	id: "laphroaig-quarter-cask";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"macallan-12": {
	id: "macallan-12";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"macallan-double-cask-12": {
	id: "macallan-double-cask-12";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"makers-mark": {
	id: "makers-mark";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"mars-iwai": {
	id: "mars-iwai";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"mars-komagatake": {
	id: "mars-komagatake";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"mars-tsunuki": {
	id: "mars-tsunuki";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"miyagikyo": {
	id: "miyagikyo";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"monkey-shoulder": {
	id: "monkey-shoulder";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"nikka-coffey-grain": {
	id: "nikka-coffey-grain";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"nikka-days": {
	id: "nikka-days";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"nikka-from-the-barrel": {
	id: "nikka-from-the-barrel";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"oban-14": {
	id: "oban-14";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"octomore": {
	id: "octomore";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"old-pulteney-12": {
	id: "old-pulteney-12";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"passport-scotch": {
	id: "passport-scotch";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"redbreast-12": {
	id: "redbreast-12";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"springbank-10": {
	id: "springbank-10";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"springbank-15": {
	id: "springbank-15";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"starward-nova": {
	id: "starward-nova";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"sullivans-cove-french-oak": {
	id: "sullivans-cove-french-oak";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"suntory-ao": {
	id: "suntory-ao";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"suntory-torys": {
	id: "suntory-torys";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"taketsuru": {
	id: "taketsuru";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"talisker-10": {
	id: "talisker-10";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"talisker-storm": {
	id: "talisker-storm";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"teachers-highland-cream": {
	id: "teachers-highland-cream";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"teeling-small-batch": {
	id: "teeling-small-batch";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"tullamore-dew": {
	id: "tullamore-dew";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"white-horse": {
	id: "white-horse";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"white-horse-fine-old": {
	id: "white-horse-fine-old";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"wild-turkey-8": {
	id: "wild-turkey-8";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"wild-turkey-rare-breed": {
	id: "wild-turkey-rare-breed";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"william-lawsons": {
	id: "william-lawsons";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"woodford-double-oaked": {
	id: "woodford-double-oaked";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"woodford-reserve": {
	id: "woodford-reserve";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"yamazaki-12": {
	id: "yamazaki-12";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"yamazaki-18": {
	id: "yamazaki-18";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"yamazaki-nas": {
	id: "yamazaki-nas";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
"yoichi": {
	id: "yoichi";
  collection: "whiskies";
  data: InferEntrySchema<"whiskies">
};
};

	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	export type ContentConfig = typeof import("./../../src/content/config.js");
}

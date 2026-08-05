/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

import type { Dictionary, Locale } from './i18n';

declare global {
  namespace App {
    interface Locals {
      locale: Locale;
      t: Dictionary;
    }
  }
}

export {};

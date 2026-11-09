import { NextResponse } from "next/server";
import { ZodError } from "zod";

/** An error that is safe to show to the user, carrying the right HTTP status. */
export class HttpError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
  }
}

type Handler<C> = (req: Request, ctx: C) => Promise<Response>;

/**
 * Wrap every route handler so errors become consistent JSON, and unexpected
 * errors never leak stack traces or secrets to the browser.
 */
export function route<C = unknown>(handler: Handler<C>): Handler<C> {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      if (err instanceof HttpError) {
        return NextResponse.json({ error: err.message, code: err.code }, { status: err.status });
      }
      // Thrown by the credit ledger (added in a later stage).
      if (err instanceof Error && err.name === "InsufficientCreditsError") {
        return NextResponse.json({ error: err.message, code: "INSUFFICIENT_CREDITS" }, { status: 402 });
      }
      if (err instanceof ZodError) {
        return NextResponse.json({ error: "Invalid request", details: err.flatten() }, { status: 400 });
      }
      console.error("Unhandled route error:", err); // goes to the server terminal only
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
  };
}
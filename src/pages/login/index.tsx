import { ArrowRight, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Brand } from "@/features/admin/components";
import { authClient } from "@/lib/auth";
import { ENV } from "@/lib/env";

export default function Login() {
	const [pending, setPending] = useState(false);
	const [error, setError] = useState("");
	const navigate = useNavigate();
	if (ENV.DEMO_MODE) return <Navigate to="/overview" replace />;
	return (
		<main className="login-screen">
			<div className="login-story">
				<Brand />
				<div>
					<span className="eyebrow">For the people behind the moments</span>
					<h1>
						Good experiences.
						<br />
						Great oversight.
					</h1>
					<p>Your place to keep Everyticket running beautifully.</p>
				</div>
				<span>Everyticket administration · 2026</span>
			</div>
			<div className="login-panel">
				<span className="login-lock">
					<LockKeyhole size={25} />
				</span>
				<p className="eyebrow">Platform administration</p>
				<h1>Welcome back.</h1>
				<p>Sign in with your administrator account.</p>
				<form
					onSubmit={async (event) => {
						event.preventDefault();
						if (!ENV.VITE_AUTH_URL) {
							setError(
								"Authentication is not configured. Set VITE_AUTH_URL before signing in.",
							);
							return;
						}
						setPending(true);
						setError("");
						const fields = new FormData(event.currentTarget);
						try {
							const response = await authClient.signIn.email({
								email: String(fields.get("email")),
								password: String(fields.get("password")),
							});
							if (response.error)
								setError(
									response.error.message ||
										"Unable to sign in. Check your credentials.",
								);
							else navigate("/overview", { replace: true });
						} catch {
							setError(
								"Unable to reach the authentication service. Please try again.",
							);
						} finally {
							setPending(false);
						}
					}}
				>
					<label className="form-field">
						Email address
						<input
							name="email"
							type="email"
							required
							autoComplete="username"
							placeholder="you@everyticket.ng"
						/>
					</label>
					<label className="form-field">
						Password
						<input
							name="password"
							type="password"
							required
							autoComplete="current-password"
							placeholder="Your password"
						/>
					</label>
					{error && (
						<p className="form-error" role="alert">
							{error}
						</p>
					)}
					<button
						type="submit"
						className="button button-primary"
						disabled={pending}
					>
						{pending ? "Signing in…" : "Sign in"}
						<ArrowRight size={16} />
					</button>
				</form>
				<p className="login-caption">
					Administrator access is provisioned by Everyticket.
				</p>
			</div>
		</main>
	);
}

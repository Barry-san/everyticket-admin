import { ArrowRight, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Brand } from "@/features/admin/components";
import { authClient } from "@/lib/auth";

export default function Login() {
	const [pending, setPending] = useState(false);
	const [error, setError] = useState("");
	const navigate = useNavigate();
	function reportError(message: string) {
		setError(message);
		toast.error(message);
	}
	const { register, handleSubmit } = useForm<{
		email: string;
		password: string;
	}>();
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
					onSubmit={handleSubmit(async (fields) => {
						setPending(true);
						setError("");
						try {
							const response = await authClient.signIn.email({
								email: fields.email,
								password: fields.password,
							});
							if (response.error)
								reportError(
									response.error.message ||
										"Unable to sign in. Check your credentials.",
								);
							else {
								toast.success("Signed in successfully.");
								navigate("/overview", { replace: true });
							}
						} catch {
							reportError(
								"Unable to reach the authentication service. Please try again.",
							);
						} finally {
							setPending(false);
						}
					})}
				>
					<label className="form-field">
						Email address
						<input
							{...register("email", { required: true })}
							type="email"
							required
							autoComplete="username"
							placeholder="you@everyticket.ng"
						/>
					</label>
					<label className="form-field">
						Password
						<input
							{...register("password", { required: true })}
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

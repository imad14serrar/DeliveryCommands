package ma.pfa.delivery.service;

import ma.pfa.delivery.dto.AdminDtos.LoginResponse;
import ma.pfa.delivery.exception.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

/** Vérifie les identifiants de l'administrateur et délivre un jeton JWT à durée limitée. */
@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtEncoder jwtEncoder;
    private final Duration tokenValidity;

    public AuthService(AuthenticationManager authenticationManager, JwtEncoder jwtEncoder,
                       @Value("${app.jwt.validity-minutes:120}") long validityMinutes) {
        this.authenticationManager = authenticationManager;
        this.jwtEncoder = jwtEncoder;
        this.tokenValidity = Duration.ofMinutes(validityMinutes);
    }

    public LoginResponse login(String username, String password) {
        Authentication auth;
        try {
            auth = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));
        } catch (AuthenticationException e) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Identifiant ou mot de passe incorrect.");
        }

        List<String> roles = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(a -> a.replaceFirst("^ROLE_", ""))
                .toList();
        Instant now = Instant.now();
        Instant expiresAt = now.plus(tokenValidity);
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("deliverycommands-api")
                .subject(auth.getName())
                .issuedAt(now)
                .expiresAt(expiresAt)
                .claim("roles", roles)
                .build();
        String token = jwtEncoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims))
                .getTokenValue();
        return new LoginResponse(token, expiresAt, auth.getName());
    }
}
